from django.db import models


class SearchQueryLog(models.Model):
    """Logs every recommendation request for analytics and debugging."""

    query = models.TextField('Запит')
    results_count = models.IntegerField('Кількість результатів', default=0)
    used_rag = models.BooleanField('Використано RAG', default=False)
    used_fallback = models.BooleanField('Використано fallback', default=False)
    processing_time_ms = models.IntegerField('Час обробки (мс)', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Лог запиту'
        verbose_name_plural = 'Логи запитів'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'"{self.query[:50]}" ({self.created_at.strftime("%d.%m.%Y %H:%M")})'
