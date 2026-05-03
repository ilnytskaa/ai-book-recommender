"""Abstract service interfaces — Dependency Inversion Principle."""
from abc import ABC, abstractmethod
from typing import Any, Dict, List


class IBookService(ABC):
    @abstractmethod
    def get_book(self, book_id: int) -> Dict[str, Any]:
        ...

    @abstractmethod
    def list_books(self, filters: Dict[str, Any]) -> List[Dict[str, Any]]:
        ...

    @abstractmethod
    def create_book(self, data: Dict[str, Any]) -> Dict[str, Any]:
        ...

    @abstractmethod
    def update_book(self, book_id: int, data: Dict[str, Any]) -> Dict[str, Any]:
        ...

    @abstractmethod
    def delete_book(self, book_id: int) -> None:
        ...


class IEmbeddingService(ABC):
    @abstractmethod
    def embed_text(self, text: str) -> List[float]:
        ...


class IRAGService(ABC):
    @abstractmethod
    def retrieve_relevant_books(self, query: str, top_k: int) -> List[Dict[str, Any]]:
        ...


class IRecommendationService(ABC):
    @abstractmethod
    def get_recommendations(self, query: str) -> Dict[str, Any]:
        ...
