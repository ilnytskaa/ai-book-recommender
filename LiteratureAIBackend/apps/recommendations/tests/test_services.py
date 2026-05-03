import pytest
from unittest.mock import MagicMock, patch

from apps.recommendations.services.rag_service import RAGService
from apps.recommendations.services.recommendation_service import RecommendationService
from core.exceptions import EmbeddingError


@pytest.fixture
def mock_book_repo():
    repo = MagicMock()
    repo.count_with_embeddings.return_value = 0
    repo.search_by_text.return_value = []
    repo.get_all.return_value = []
    return repo


@pytest.fixture
def mock_embedding_service():
    svc = MagicMock()
    svc.embed_text.return_value = [0.1] * 1536
    return svc


@pytest.fixture
def mock_recommendation_repo():
    repo = MagicMock()
    repo.log_query.return_value = MagicMock()
    return repo


class TestRAGService:
    def test_falls_back_to_keyword_when_no_embeddings(
        self, mock_book_repo, mock_embedding_service
    ):
        mock_book_repo.count_with_embeddings.return_value = 0
        mock_book_repo.search_by_text.return_value = []
        mock_book_repo.get_all.return_value = []

        svc = RAGService(mock_book_repo, mock_embedding_service, top_k=5)
        result = svc.retrieve_relevant_books('фентезі')
        assert result == []

    def test_uses_semantic_search_when_embeddings_exist(
        self, mock_book_repo, mock_embedding_service
    ):
        from apps.books.models import Book
        book = Book(id=1, title='Хоббіт', author='Толкін',
                    description='Пригоди', genre='Фентезі')
        mock_book_repo.count_with_embeddings.return_value = 5
        mock_book_repo.find_similar_by_embedding.return_value = [book]

        svc = RAGService(mock_book_repo, mock_embedding_service, top_k=5)
        result = svc.retrieve_relevant_books('пригоди в середземʼї')
        assert len(result) == 1
        assert result[0]['title'] == 'Хоббіт'

    def test_falls_back_on_embedding_error(
        self, mock_book_repo, mock_embedding_service
    ):
        mock_book_repo.count_with_embeddings.return_value = 5
        mock_embedding_service.embed_text.side_effect = EmbeddingError('API error')
        mock_book_repo.search_by_text.return_value = []
        mock_book_repo.get_all.return_value = []

        svc = RAGService(mock_book_repo, mock_embedding_service, top_k=5)
        result = svc.retrieve_relevant_books('будь-що')
        assert result == []


class TestRecommendationService:
    def test_returns_static_fallback_when_no_books_and_no_openai(
        self, mock_book_repo, mock_embedding_service, mock_recommendation_repo
    ):
        rag = RAGService(mock_book_repo, mock_embedding_service, top_k=5)
        svc = RecommendationService(
            rag_service=rag,
            api_key='',
            model='gpt-3.5-turbo',
            recommendation_repository=mock_recommendation_repo,
        )
        result = svc.get_recommendations('цікава книга')
        assert 'recommendations' in result
        assert len(result['recommendations']) > 0
        assert 'note' in result

    def test_logs_query(
        self, mock_book_repo, mock_embedding_service, mock_recommendation_repo
    ):
        rag = RAGService(mock_book_repo, mock_embedding_service, top_k=5)
        svc = RecommendationService(
            rag_service=rag,
            api_key='',
            model='gpt-3.5-turbo',
            recommendation_repository=mock_recommendation_repo,
        )
        svc.get_recommendations('тест')
        mock_recommendation_repo.log_query.assert_called_once()
