"""Recommendation repository — single responsibility: query log persistence."""
from typing import Any, Dict, List, Optional

from django.db.models import Avg

from apps.recommendations.models import SearchQueryLog


class RecommendationRepository:
    def log_query(
        self,
        query: str,
        results_count: int,
        used_rag: bool,
        used_fallback: bool,
        search_mode: Optional[str] = None,
        processing_time_ms: Optional[int] = None,
        quality_relevance: Optional[int] = None,
        quality_explainability: Optional[int] = None,
        quality_db_binding: Optional[int] = None,
        quality_controllability: Optional[int] = None,
    ) -> SearchQueryLog:
        return SearchQueryLog.objects.create(
            query=query,
            results_count=results_count,
            used_rag=used_rag,
            used_fallback=used_fallback,
            search_mode=search_mode,
            processing_time_ms=processing_time_ms,
            quality_relevance=quality_relevance,
            quality_explainability=quality_explainability,
            quality_db_binding=quality_db_binding,
            quality_controllability=quality_controllability,
        )

    def get_recent_logs(self, limit: int = 50) -> List[SearchQueryLog]:
        return list(SearchQueryLog.objects.all()[:limit])

    def get_comparison_stats(self) -> Dict[str, Any]:
        """Aggregated quality averages grouped by RAG vs GPT mode."""
        def _agg(qs) -> Dict[str, Any]:
            count = qs.count()
            if count == 0:
                return {'count': 0, 'relevance': None, 'explainability': None,
                        'db_binding': None, 'controllability': None}
            agg = qs.aggregate(
                relevance=Avg('quality_relevance'),
                explainability=Avg('quality_explainability'),
                db_binding=Avg('quality_db_binding'),
                controllability=Avg('quality_controllability'),
            )
            return {'count': count, **{k: round(v, 2) if v is not None else None
                                       for k, v in agg.items()}}

        scored = SearchQueryLog.objects.filter(
            quality_relevance__isnull=False,
            search_mode__isnull=False,
        )
        return {
            'rag':     _agg(scored.filter(search_mode='rag')),
            'gpt':     _agg(scored.filter(search_mode='gpt')),
            'keyword': _agg(scored.filter(search_mode='keyword')),
        }
