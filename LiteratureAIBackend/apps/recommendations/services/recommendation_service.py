"""Recommendation service — orchestrates RAG + OpenAI to produce book recommendations."""
import json
import logging
import time
from typing import Any, Dict, List

from openai import OpenAI

from core.interfaces.service import IRecommendationService
from core.exceptions import RecommendationError
from apps.recommendations.services.rag_service import RAGService
from apps.recommendations.repositories.recommendation_repository import RecommendationRepository
from apps.books.repositories.book_repository import BookRepository

logger = logging.getLogger(__name__)

_SYSTEM_MESSAGE = (
    'You are a literature expert. '
    'Reply only with a valid JSON array and no additional text.'
)

FALLBACK_BOOKS: List[Dict[str, Any]] = [
    {
        'title': '1984',
        'author': 'George Orwell',
        'description': 'A dystopian novel set in a totalitarian future society where Big Brother watches every move of its citizens.',
        'genre': 'Dystopia',
        'year': 1949,
        'rating': 4.8,
        'reason': 'A classic that makes you think about freedom, privacy, and the control of power.',
    },
    {
        'title': 'The Little Prince',
        'author': 'Antoine de Saint-Exupéry',
        'description': 'A philosophical tale about a little prince who travels between planets and discovers essential truths about life.',
        'genre': 'Philosophical Fiction',
        'year': 1943,
        'rating': 4.6,
        'reason': 'A touching story about friendship, love, and the meaning of life.',
    },
    {
        'title': 'Brave New World',
        'author': 'Aldous Huxley',
        'description': 'A dystopian novel set in a futuristic World State where citizens are conditioned for happiness and social stability.',
        'genre': 'Dystopia',
        'year': 1932,
        'rating': 4.5,
        'reason': 'A thought-provoking exploration of technology, freedom, and what it means to be human.',
    },
]


_NOT_FOUND_MESSAGES = {
    'rag': (
        'No sufficiently relevant books were found in the local database for this query. '
        'Try rephrasing or broadening your request.'
    ),
    'keyword': (
        'No results found in the database for the given keywords. '
        'Try simpler or different words.'
    ),
}


class RecommendationService(IRecommendationService):

    def __init__(
        self,
        rag_service: RAGService,
        api_key: str,
        model: str,
        recommendation_repository: RecommendationRepository,
        book_repository: BookRepository,
    ) -> None:
        self._rag = rag_service
        self._client = OpenAI(api_key=api_key) if api_key else None
        self._model = model
        self._repo = recommendation_repository
        self._book_repo = book_repository

    def get_recommendations(self, query: str, search_mode: str = 'rag') -> Dict[str, Any]:
        start = time.monotonic()
        used_fallback = False
        not_found = False

        if search_mode == 'keyword':
            recommendations = self._keyword_search(query)
            if not recommendations:
                not_found = True
        elif search_mode == 'rag':
            context_books = self._rag.retrieve_relevant_books(query)
            if not context_books:
                not_found = True
                recommendations = []
            elif self._client:
                try:
                    recommendations = self._call_openai_with_context(query, context_books)
                    if not recommendations:
                        not_found = True
                except Exception as exc:
                    logger.error('OpenAI call failed: %s', exc, exc_info=True)
                    recommendations = self._format_fallback(context_books, query)
                    used_fallback = True
            else:
                recommendations = self._format_fallback(context_books, query)
                used_fallback = True
        else:  # gpt
            if self._client:
                try:
                    recommendations = self._call_openai_no_context(query)
                except Exception as exc:
                    logger.error('OpenAI call failed: %s', exc, exc_info=True)
                    recommendations = self._get_static_fallback(query)
                    used_fallback = True
            else:
                recommendations = self._get_static_fallback(query)
                used_fallback = True

        self._annotate_in_local_db(recommendations, search_mode=search_mode)
        quality_score = self._compute_quality_score(recommendations, search_mode=search_mode)

        elapsed_ms = int((time.monotonic() - start) * 1000)
        self._repo.log_query(
            query=query,
            results_count=len(recommendations),
            used_rag=(search_mode == 'rag'),
            used_fallback=used_fallback,
            search_mode=search_mode,
            processing_time_ms=elapsed_ms,
            quality_relevance=quality_score['relevance'],
            quality_explainability=quality_score['explainability'],
            quality_db_binding=quality_score['db_binding'],
            quality_controllability=self._risk_to_controllability(
                quality_score['hallucination_risk']
            ),
        )

        result: Dict[str, Any] = {
            'recommendations': recommendations,
            'query': query,
            'search_mode': search_mode,
            'not_found': not_found,
            'quality_score': quality_score,
        }
        if not_found:
            result['note'] = _NOT_FOUND_MESSAGES.get(search_mode, '')
        elif used_fallback and not self._client:
            result['note'] = (
                'Demo recommendations from the database. '
                'Add an OpenAI API key for personalised responses.'
            )
        return result

    def _keyword_search(self, query: str) -> List[Dict[str, Any]]:
        books = self._book_repo.search_by_text(query)
        return [
            {
                'title': b.title,
                'author': b.author,
                'description': b.description,
                'genre': b.genre,
                'year': b.year,
                'rating': b.rating,
                'reason': f'Found by keywords "{query}" in title, author, or description.',
                'in_local_db': True,
            }
            for b in books[:5]
        ]

    @staticmethod
    def _compute_quality_score(
        recommendations: List[Dict[str, Any]], search_mode: str
    ) -> Dict[str, Any]:
        count = len(recommendations)
        relevance = min(count, 5) if count >= 2 else max(count, 1)

        if search_mode == 'keyword':
            # Keyword: mechanical match — no AI explanation
            return {
                'relevance': relevance,
                'explainability': 2,
                'db_binding': 5,
                'hallucination_risk': 'none',
            }

        avg_reason = (
            sum(len(r.get('reason', '')) for r in recommendations) / count
            if count else 0
        )
        if avg_reason >= 150:
            explainability = 5
        elif avg_reason >= 100:
            explainability = 4
        elif avg_reason >= 60:
            explainability = 3
        elif avg_reason >= 30:
            explainability = 2
        else:
            explainability = 1

        if search_mode == 'rag':
            db_binding = 5
            hallucination_risk = 'low'
        else:  # gpt
            in_db = sum(1 for r in recommendations if r.get('in_local_db'))
            db_binding = round((in_db / count) * 5) if count else 0
            not_in_db_ratio = 1 - (in_db / count) if count else 1
            if not_in_db_ratio <= 0.2:
                hallucination_risk = 'low'
            elif not_in_db_ratio <= 0.6:
                hallucination_risk = 'medium'
            else:
                hallucination_risk = 'high'

        return {
            'relevance': relevance,
            'explainability': explainability,
            'db_binding': db_binding,
            'hallucination_risk': hallucination_risk,
        }

    @staticmethod
    def _risk_to_controllability(risk: str) -> int:
        return {'none': 5, 'low': 5, 'medium': 3, 'high': 1}.get(risk, 3)

    def _annotate_in_local_db(
        self, recommendations: List[Dict[str, Any]], search_mode: str
    ) -> None:
        if search_mode in ('rag', 'keyword'):
            for rec in recommendations:
                rec['in_local_db'] = True
            return
        titles = [r.get('title', '') for r in recommendations if r.get('title')]
        found = self._book_repo.titles_in_db(titles) if titles else set()
        for rec in recommendations:
            rec['in_local_db'] = rec.get('title', '').lower() in found

    def _call_openai_with_context(
        self, query: str, context_books: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        books_text = '\n'.join(
            f'- "{b["title"]}" ({b["author"]}, {b.get("year", "?")}): {b["description"]}'
            for b in context_books
        )
        prompt = (
            f'You are an experienced librarian and literary critic.\n'
            f'The user described their request: "{query}"\n\n'
            f'From our database we pre-selected these books as potentially relevant:\n'
            f'{books_text}\n\n'
            f'Choose the 3-5 best books from the list above and explain why they are a good fit. '
            f'Reply ONLY with a valid JSON array:\n'
            f'[{{"title":"...","author":"...","description":"...","genre":"...","year":0,'
            f'"rating":0.0,"reason":"..."}}]'
        )
        try:
            return self._call_openai_raw(prompt)
        except json.JSONDecodeError:
            logger.warning('OpenAI returned invalid JSON, using context books as fallback.')
            return self._format_fallback(context_books, query)

    def _call_openai_no_context(self, query: str) -> List[Dict[str, Any]]:
        prompt = (
            f'You are an experienced librarian and literary critic.\n'
            f'The user described their request: "{query}"\n\n'
            f'Recommend 3-5 books from your knowledge that best fit this request. '
            f'Reply ONLY with a valid JSON array:\n'
            f'[{{"title":"...","author":"...","description":"...","genre":"...","year":0,'
            f'"rating":0.0,"reason":"..."}}]'
        )
        try:
            return self._call_openai_raw(prompt)
        except json.JSONDecodeError:
            logger.warning('OpenAI returned invalid JSON (no-RAG mode).')
            return self._get_static_fallback(query)

    def _call_openai_raw(self, prompt: str) -> List[Dict[str, Any]]:
        completion = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {'role': 'system', 'content': _SYSTEM_MESSAGE},
                {'role': 'user', 'content': prompt},
            ],
            max_tokens=2000,
            temperature=0.7,
            timeout=30,
        )
        response_text = completion.choices[0].message.content or ''
        recommendations = json.loads(response_text)
        return [
            r for r in recommendations
            if r.get('title') and r.get('author') and r.get('reason')
        ]

    @staticmethod
    def _format_fallback(
        books: List[Dict[str, Any]], query: str
    ) -> List[Dict[str, Any]]:
        return [
            {
                'title': b['title'],
                'author': b['author'],
                'description': b['description'],
                'genre': b['genre'],
                'year': b.get('year'),
                'rating': b.get('rating'),
                'reason': f'Selected for query "{query}" based on semantic search in the database.',
            }
            for b in books[:5]
        ]

    @staticmethod
    def _get_static_fallback(query: str) -> List[Dict[str, Any]]:
        return [
            {**b, 'reason': f'Selected for query "{query}": {b["reason"]}'}
            for b in FALLBACK_BOOKS
        ]
