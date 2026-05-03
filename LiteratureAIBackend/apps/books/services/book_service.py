"""Book service — single responsibility: business logic for books."""
from typing import Any, Dict, List, Optional

from core.interfaces.service import IBookService
from core.exceptions import BookNotFoundError
from apps.books.repositories.book_repository import BookRepository
from apps.books.models import Book


class BookService(IBookService):
    """Encapsulates all book-related business rules."""

    def __init__(self, book_repository: BookRepository) -> None:
        self._repo = book_repository

    def get_book(self, book_id: int) -> Book:
        book = self._repo.get_by_id(book_id)
        if book is None:
            raise BookNotFoundError(book_id)
        return book

    def list_books(self, filters: Optional[Dict[str, Any]] = None) -> List[Book]:
        if not filters:
            return self._repo.get_all()
        return self._repo.filter(**filters)

    def search_books(self, query: str) -> List[Book]:
        if not query or not query.strip():
            return []
        return self._repo.search_by_text(query.strip())

    def create_book(self, data: Dict[str, Any]) -> Book:
        return self._repo.create(**data)

    def update_book(self, book_id: int, data: Dict[str, Any]) -> Book:
        book = self._repo.update(book_id, **data)
        if book is None:
            raise BookNotFoundError(book_id)
        return book

    def delete_book(self, book_id: int) -> None:
        deleted = self._repo.delete(book_id)
        if not deleted:
            raise BookNotFoundError(book_id)

    def get_stats(self) -> Dict[str, int]:
        return {
            'total': self._repo.count(),
            'with_embeddings': self._repo.count_with_embeddings(),
        }
