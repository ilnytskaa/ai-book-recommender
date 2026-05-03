from django.db import models
from pgvector.django import VectorField


class Book(models.Model):
    """Book model with vector embedding for RAG-based recommendations."""

    title = models.CharField('Назва', max_length=512)
    author = models.CharField('Автор', max_length=255)
    description = models.TextField('Опис')
    genre = models.CharField('Жанр', max_length=128)
    year = models.IntegerField('Рік видання', null=True, blank=True)
    rating = models.FloatField('Рейтинг', null=True, blank=True)

    # Vector embedding for semantic search (RAG)
    embedding = VectorField(dimensions=1536, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = 'Книга'
        verbose_name_plural = 'Книги'
        ordering = ['title']
        indexes = [
            models.Index(fields=['genre']),
            models.Index(fields=['author']),
            models.Index(fields=['year']),
        ]

    def __str__(self) -> str:
        return f'{self.title} — {self.author}'

    @property
    def has_embedding(self) -> bool:
        return self.embedding is not None
