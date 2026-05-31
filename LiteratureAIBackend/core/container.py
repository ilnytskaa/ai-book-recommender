"""Dependency Injection container using dependency-injector."""
from dependency_injector import containers, providers
from django.conf import settings

from apps.books.repositories.book_repository import BookRepository
from apps.books.services.book_service import BookService
from apps.recommendations.repositories.recommendation_repository import RecommendationRepository
from apps.recommendations.services.embedding_service import OpenAIEmbeddingService
from apps.recommendations.services.rag_service import RAGService
from apps.recommendations.services.recommendation_service import RecommendationService


class Container(containers.DeclarativeContainer):
    """IoC container — wires all application dependencies."""

    wiring_config = containers.WiringConfiguration(
        modules=[
            'apps.books.views',
            'apps.recommendations.views',
        ]
    )

    # Repositories
    book_repository = providers.Factory(BookRepository)
    recommendation_repository = providers.Factory(RecommendationRepository)

    # Services
    book_service = providers.Factory(
        BookService,
        book_repository=book_repository,
    )

    embedding_service = providers.Singleton(
        OpenAIEmbeddingService,
        api_key=providers.Callable(lambda: settings.OPENAI_API_KEY),
        model=providers.Callable(lambda: settings.EMBEDDING_MODEL),
    )

    rag_service = providers.Factory(
        RAGService,
        book_repository=book_repository,
        embedding_service=embedding_service,
        top_k=providers.Callable(lambda: settings.RAG_TOP_K),
    )

    recommendation_service = providers.Factory(
        RecommendationService,
        rag_service=rag_service,
        api_key=providers.Callable(lambda: settings.OPENAI_API_KEY),
        model=providers.Callable(lambda: settings.RECOMMENDATION_MODEL),
        recommendation_repository=recommendation_repository,
        book_repository=book_repository,
    )
