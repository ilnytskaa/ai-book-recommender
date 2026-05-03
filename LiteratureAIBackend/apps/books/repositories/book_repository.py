"""Book repository — single responsibility: database access for books."""
from typing import List, Optional

from pgvector.django import CosineDistance

from core.interfaces.repository import IRepository
from core.exceptions import BookNotFoundError
from apps.books.models import Book


class BookRepository(IRepository[Book]):
    """Concrete implementation of book data access."""

    def get_by_id(self, entity_id: int) -> Optional[Book]:
        try:
            return Book.objects.get(pk=entity_id)
        except Book.DoesNotExist:
            return None

    def get_by_id_or_raise(self, entity_id: int) -> Book:
        book = self.get_by_id(entity_id)
        if book is None:
            raise BookNotFoundError(entity_id)
        return book

    def get_all(self) -> List[Book]:
        return list(Book.objects.all())

    def filter(self, **kwargs) -> List[Book]:
        return list(Book.objects.filter(**kwargs))

    def search_by_text(self, query: str) -> List[Book]:
        return list(
            Book.objects.filter(
                title__icontains=query
            ) | Book.objects.filter(
                author__icontains=query
            ) | Book.objects.filter(
                description__icontains=query
            )
        )

    def find_similar_by_embedding(
        self, embedding: List[float], top_k: int = 8
    ) -> List[Book]:
        """Semantic similarity search using cosine distance via pgvector."""
        return list(
            Book.objects
            .filter(embedding__isnull=False)
            .order_by(CosineDistance('embedding', embedding))
            [:top_k]
        )

    def create(self, **kwargs) -> Book:
        return Book.objects.create(**kwargs)

    def update(self, entity_id: int, **kwargs) -> Optional[Book]:
        updated = Book.objects.filter(pk=entity_id).update(**kwargs)
        if updated == 0:
            return None
        return self.get_by_id(entity_id)

    def delete(self, entity_id: int) -> bool:
        deleted, _ = Book.objects.filter(pk=entity_id).delete()
        return deleted > 0

    def count(self) -> int:
        return Book.objects.count()

    def count_with_embeddings(self) -> int:
        return Book.objects.filter(embedding__isnull=False).count()
