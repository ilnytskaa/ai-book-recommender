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

logger = logging.getLogger(__name__)

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


class RecommendationService(IRecommendationService):
    """
    Orchestrates the full recommendation pipeline:
    1. Retrieve relevant books from DB via RAG
    2. Build a context-aware prompt
    3. Call OpenAI to rank/explain recommendations
    4. Log the query
    """

    def __init__(
        self,
        rag_service: RAGService,
        api_key: str,
        model: str,
        recommendation_repository: RecommendationRepository,
    ) -> None:
        self._rag = rag_service
        self._client = OpenAI(api_key=api_key) if api_key else None
        self._model = model
        self._repo = recommendation_repository

    def get_recommendations(self, query: str) -> Dict[str, Any]:
        start = time.monotonic()
        used_rag = False
        used_fallback = False

        context_books = self._rag.retrieve_relevant_books(query)
        used_rag = len(context_books) > 0

        if self._client and context_books:
            try:
                recommendations = self._call_openai(query, context_books)
            except Exception as exc:
                logger.error('OpenAI call failed: %s', exc)
                recommendations = self._format_fallback(context_books, query)
                used_fallback = True
        elif context_books:
            recommendations = self._format_fallback(context_books, query)
            used_fallback = True
        else:
            recommendations = self._get_static_fallback(query)
            used_fallback = True

        elapsed_ms = int((time.monotonic() - start) * 1000)
        self._repo.log_query(
            query=query,
            results_count=len(recommendations),
            used_rag=used_rag,
            used_fallback=used_fallback,
            processing_time_ms=elapsed_ms,
        )

        result: Dict[str, Any] = {'recommendations': recommendations, 'query': query}
        if used_fallback and not self._client:
            result['note'] = (
                'Демонстраційні рекомендації з бази даних. '
                'Додайте OpenAI API ключ для персоналізованих відповідей.'
            )
        return result

    def _call_openai(
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

        completion = self._client.chat.completions.create(
            model=self._model,
            messages=[
                {
                    'role': 'system',
                    'content': (
                        'Ти — експерт з літератури. '
                        'Відповідай тільки валідним JSON масивом без додаткового тексту.'
                    ),
                },
                {'role': 'user', 'content': prompt},
            ],
            max_tokens=2000,
            temperature=0.7,
        )

        response_text = completion.choices[0].message.content or ''
        try:
            recommendations = json.loads(response_text)
        except json.JSONDecodeError:
            logger.warning('OpenAI returned invalid JSON, using context books as fallback.')
            return self._format_fallback(context_books, query)

        return [
            r for r in recommendations
            if r.get('title') and r.get('author') and r.get('reason')
        ]

    @staticmethod
    def _format_fallback(
        books: List[Dict[str, Any]], query: str
    ) -> List[Dict[str, Any]]:
        result = []
        for b in books[:5]:
            result.append({
                'title': b['title'],
                'author': b['author'],
                'description': b['description'],
                'genre': b['genre'],
                'year': b.get('year'),
                'rating': b.get('rating'),
                'reason': f'Підібрано за запитом "{query}" на основі семантичного пошуку в базі даних.',
            })
        return result

    @staticmethod
    def _get_static_fallback(query: str) -> List[Dict[str, Any]]:
        return [
            {**b, 'reason': f'Підібрано для запиту "{query}": {b["reason"]}'}
            for b in FALLBACK_BOOKS
        ]
