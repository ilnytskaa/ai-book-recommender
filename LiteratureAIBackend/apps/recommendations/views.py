"""Recommendations HTTP views — async Django views for non-blocking I/O."""
import logging

from dependency_injector.wiring import Provide, inject
from drf_spectacular.utils import extend_schema
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.container import Container
from apps.recommendations.serializers import (
    RecommendationRequestSerializer,
    RecommendationResponseSerializer,
    SearchQueryLogSerializer,
)
from apps.recommendations.services.recommendation_service import RecommendationService
from apps.recommendations.repositories.recommendation_repository import RecommendationRepository

logger = logging.getLogger(__name__)


class RecommendationView(APIView):
    """
    POST /api/recommendations/
    Accepts { "query": "..." } and returns book recommendations.
    Uses RAG: embeddings → semantic search → OpenAI GPT → response.
    """

    @inject
    def __init__(
        self,
        recommendation_service: RecommendationService = Provide[Container.recommendation_service],
        **kwargs,
    ):
        super().__init__(**kwargs)
        self._service = recommendation_service

    @extend_schema(
        summary='Get book recommendations',
        description='Accepts a text query and returns book recommendations using RAG (semantic search + GPT).',
        request=RecommendationRequestSerializer,
        responses=RecommendationResponseSerializer,
    )
    def post(self, request: Request) -> Response:
        serializer = RecommendationRequestSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(
                {'error': serializer.errors.get('query', ['Невірний запит'])[0]},
                status=400,
            )

        query: str = serializer.validated_data['query']
        logger.info('Recommendation request: "%s"', query)

        result = self._service.get_recommendations(query)
        return Response(result)

    def options(self, request: Request, *args, **kwargs) -> Response:
        response = Response()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type'
        return response


class SearchHistoryView(APIView):
    """GET /api/recommendations/history/ — recent search logs."""

    @inject
    def __init__(
        self,
        recommendation_repository: RecommendationRepository = Provide[Container.recommendation_repository],
        **kwargs,
    ):
        super().__init__(**kwargs)
        self._repo = recommendation_repository

    @extend_schema(
        summary='Search history',
        responses=SearchQueryLogSerializer(many=True),
    )
    def get(self, request: Request) -> Response:
        logs = self._repo.get_recent_logs(limit=50)
        serializer = SearchQueryLogSerializer(logs, many=True)
        return Response(serializer.data)
