"""RAG service — retrieves relevant books via semantic similarity search."""
import logging
from typing import Any, Dict, List

from core.interfaces.service import IRAGService, IEmbeddingService
from core.exceptions import EmbeddingError
from apps.books.repositories.book_repository import BookRepository
from apps.books.models import Book

logger = logging.getLogger(__name__)


def _book_to_dict(book: Book) -> Dict[str, Any]:
    return {
        'id': book.id,
        'title': book.title,
        'author': book.author,
        'description': book.description,
        'genre': book.genre,
        'year': book.year,
        'rating': book.rating,
    }


class RAGService(IRAGService):
    """
    Retrieval-Augmented Generation service.

    Strategy pattern: tries semantic search first (when embeddings exist),
    falls back to keyword search when embeddings are unavailable.
    """

    def __init__(
        self,
        book_repository: BookRepository,
        embedding_service: IEmbeddingService,
        top_k: int = 8,
    ) -> None:
        self._repo = book_repository
        self._embedding_service = embedding_service
        self._top_k = top_k

    def retrieve_relevant_books(
        self, query: str, top_k: int | None = None
    ) -> List[Dict[str, Any]]:
        """
        Returns top_k books most relevant to the query.
        Uses cosine similarity on embeddings when available,
        falls back to full-text keyword search.
        """
        k = top_k or self._top_k

        if self._repo.count_with_embeddings() > 0:
            return self._semantic_search(query, k)

        logger.warning('No embeddings found, falling back to keyword search.')
        return self._keyword_search(query, k)

    def _semantic_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        try:
            query_embedding = self._embedding_service.embed_text(query)
            books = self._repo.find_similar_by_embedding(query_embedding, top_k)
            logger.info('Semantic search returned %d books for query "%s"', len(books), query)
            return [_book_to_dict(b) for b in books]
        except EmbeddingError as exc:
            logger.warning('Semantic search failed (%s), falling back to keyword.', exc)
            return self._keyword_search(query, top_k)

    def _keyword_search(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        # RAG is honest: if text search finds nothing, return empty rather than
        # serving unrelated books from the full DB.
        books = self._repo.search_by_text(query)
        return [_book_to_dict(b) for b in books[:top_k]]
