"""Domain exceptions — clear separation from HTTP layer."""


class BookNotFoundError(Exception):
    def __init__(self, book_id: int):
        super().__init__(f'Книгу з ID {book_id} не знайдено')
        self.book_id = book_id


class EmbeddingError(Exception):
    """Raised when embedding generation fails."""


class RecommendationError(Exception):
    """Raised when recommendation generation fails."""


class ValidationError(Exception):
    """Raised on domain validation failure."""
