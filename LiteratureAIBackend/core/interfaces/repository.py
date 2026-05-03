"""Abstract repository interfaces — Dependency Inversion Principle."""
from abc import ABC, abstractmethod
from typing import Generic, List, Optional, TypeVar

T = TypeVar('T')


class IReadRepository(ABC, Generic[T]):
    """Read-only repository interface — Interface Segregation Principle."""

    @abstractmethod
    def get_by_id(self, entity_id: int) -> Optional[T]:
        ...

    @abstractmethod
    def get_all(self) -> List[T]:
        ...


class IWriteRepository(ABC, Generic[T]):
    """Write-only repository interface — Interface Segregation Principle."""

    @abstractmethod
    def create(self, **kwargs) -> T:
        ...

    @abstractmethod
    def update(self, entity_id: int, **kwargs) -> Optional[T]:
        ...

    @abstractmethod
    def delete(self, entity_id: int) -> bool:
        ...


class IRepository(IReadRepository[T], IWriteRepository[T]):
    """Full CRUD repository — composes read and write interfaces."""
