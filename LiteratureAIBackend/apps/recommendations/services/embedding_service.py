"""Embedding service — single responsibility: text → vector conversion."""
import logging
from typing import List

from openai import OpenAI

from core.interfaces.service import IEmbeddingService
from core.exceptions import EmbeddingError

logger = logging.getLogger(__name__)


class OpenAIEmbeddingService(IEmbeddingService):
    """Uses OpenAI Embeddings API to convert text to semantic vectors."""

    def __init__(self, api_key: str, model: str = 'text-embedding-3-small') -> None:
        self._client = OpenAI(api_key=api_key)
        self._model = model

    def embed_text(self, text: str) -> List[float]:
        """Convert text to a 1536-dimensional embedding vector."""
        if not text or not text.strip():
            raise EmbeddingError('Cannot embed empty text.')
        try:
            response = self._client.embeddings.create(
                model=self._model,
                input=text.strip(),
            )
            return response.data[0].embedding
        except Exception as exc:
            logger.error('Embedding generation failed: %s', exc)
            raise EmbeddingError(f'Помилка генерації ембедінгу: {exc}') from exc

    def embed_book(self, title: str, author: str, description: str, genre: str) -> List[float]:
        """Build a rich book representation before embedding for better retrieval."""
        text = f'Назва: {title}. Автор: {author}. Жанр: {genre}. Опис: {description}'
        return self.embed_text(text)
