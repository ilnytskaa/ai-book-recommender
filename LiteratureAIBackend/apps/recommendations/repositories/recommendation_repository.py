"""Recommendation repository — single responsibility: query log persistence."""
from typing import List

from apps.recommendations.models import SearchQueryLog


class RecommendationRepository:
    def log_query(
        self,
        query: str,
        results_count: int,
        used_rag: bool,
        used_fallback: bool,
        processing_time_ms: int | None = None,
    ) -> SearchQueryLog:
        return SearchQueryLog.objects.create(
            query=query,
            results_count=results_count,
            used_rag=used_rag,
            used_fallback=used_fallback,
            processing_time_ms=processing_time_ms,
        )

    def get_recent_logs(self, limit: int = 50) -> List[SearchQueryLog]:
        return list(SearchQueryLog.objects.all()[:limit])
