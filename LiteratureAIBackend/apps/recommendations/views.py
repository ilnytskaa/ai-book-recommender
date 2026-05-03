"""Recommendations HTTP views — async Django views for non-blocking I/O."""
import asyncio
import logging

from dependency_injector.wiring import Provide, inject
from django.http import JsonResponse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from rest_framework.parsers import JSONParser
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.container import Container
from apps.recommendations.serializers import (
    RecommendationRequestSerializer,
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

    def get(self, request: Request) -> Response:
        logs = self._repo.get_recent_logs(limit=50)
        serializer = SearchQueryLogSerializer(logs, many=True)
        return Response(serializer.data)
