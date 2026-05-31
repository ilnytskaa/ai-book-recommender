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
    'Ти — експерт з літератури. '
    'Відповідай тільки валідним JSON масивом без додаткового тексту.'
)

FALLBACK_BOOKS: List[Dict[str, Any]] = [
    {
        'title': '1984',
        'author': 'Джордж Орвелл',
        'description': 'Антиутопічний роман про тоталітарне суспільство майбутнього, де Великий Брат стежить за кожним кроком громадян.',
        'genre': 'Антиутопія',
        'year': 1949,
        'rating': 4.8,
        'reason': 'Класична книга, яка змушує замислитися про свободу, приватність та контроль влади.',
    },
    {
        'title': 'Маленький принц',
        'author': 'Антуан де Сент-Екзюпері',
        'description': 'Філософська казка про маленького принца, який подорожує планетами та відкриває важливі життєві істини.',
        'genre': 'Філософська казка',
        'year': 1943,
        'rating': 4.6,
        'reason': 'Зворушлива історія про дружбу, любов та сенс життя.',
    },
    {
        'title': 'Кобзар',
        'author': 'Тарас Шевченко',
        'description': 'Збірка поезій великого українського поета, символ української літератури та самосвідомості.',
        'genre': 'Поезія',
        'year': 1840,
        'rating': 4.9,
        'reason': 'Основа української літератури, обов\'язкова для розуміння української культури.',
    },
]


_NOT_FOUND_MESSAGES = {
    'rag': (
        'У локальній базі не знайдено достатньо релевантних книг для цього запиту. '
        'Спробуйте уточнити або змінити запит.'
    ),
    'keyword': (
        'За вказаними ключовими словами нічого не знайдено в базі. '
        'Спробуйте простіші або інші слова.'
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
                'Демонстраційні рекомендації з бази даних. '
                'Додайте OpenAI API ключ для персоналізованих відповідей.'
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
                'reason': f'Знайдено за ключовими словами "{query}" у назві, авторі або описі.',
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
                'hallucination_risk': 'відсутній',
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
            hallucination_risk = 'низький'
        else:  # gpt
            in_db = sum(1 for r in recommendations if r.get('in_local_db'))
            db_binding = round((in_db / count) * 5) if count else 0
            not_in_db_ratio = 1 - (in_db / count) if count else 1
            if not_in_db_ratio <= 0.2:
                hallucination_risk = 'низький'
            elif not_in_db_ratio <= 0.6:
                hallucination_risk = 'середній'
            else:
                hallucination_risk = 'високий'

        return {
            'relevance': relevance,
            'explainability': explainability,
            'db_binding': db_binding,
            'hallucination_risk': hallucination_risk,
        }

    @staticmethod
    def _risk_to_controllability(risk: str) -> int:
        return {'відсутній': 5, 'низький': 5, 'середній': 3, 'високий': 1}.get(risk, 3)

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
            f'- «{b["title"]}» ({b["author"]}, {b.get("year", "?")}): {b["description"]}'
            for b in context_books
        )
        prompt = (
            f'Ти — досвідчений бібліотекар та літературний критик.\n'
            f'Користувач описав свій запит: "{query}"\n\n'
            f'З нашої бази даних ми попередньо відібрали ці книги як потенційно релевантні:\n'
            f'{books_text}\n\n'
            f'Вибери 3-5 найкращих книг з наведеного списку та поясни, '
            f'чому саме вони підходять. Відповідай ТІЛЬКИ валідним JSON масивом:\n'
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
            f'Ти — досвідчений бібліотекар та літературний критик.\n'
            f'Користувач описав свій запит: "{query}"\n\n'
            f'Порекомендуй 3-5 книг зі своїх знань, які найкраще підходять до цього запиту. '
            f'Відповідай ТІЛЬКИ валідним JSON масивом:\n'
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
                'reason': f'Підібрано за запитом "{query}" на основі семантичного пошуку в базі даних.',
            }
            for b in books[:5]
        ]

    @staticmethod
    def _get_static_fallback(query: str) -> List[Dict[str, Any]]:
        return [
            {**b, 'reason': f'Підібрано для запиту "{query}": {b["reason"]}'}
            for b in FALLBACK_BOOKS
        ]
