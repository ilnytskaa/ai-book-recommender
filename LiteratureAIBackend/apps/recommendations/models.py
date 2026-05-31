from django.db import models


class SearchQueryLog(models.Model):
    """Logs every recommendation request for analytics and debugging."""

    query = models.TextField('Запит')
    results_count = models.IntegerField('Кількість результатів', default=0)
    used_rag = models.BooleanField('Використано RAG', default=False)
    used_fallback = models.BooleanField('Використано fallback', default=False)
    processing_time_ms = models.IntegerField('Час обробки (мс)', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    # Quality scores (1–5 scale); null means recorded before this feature was added
    quality_relevance = models.SmallIntegerField('Релевантність (1-5)', null=True, blank=True)
    quality_explainability = models.SmallIntegerField('Пояснюваність (1-5)', null=True, blank=True)
    quality_db_binding = models.SmallIntegerField("Прив'язка до бази (1-5)", null=True, blank=True)
    quality_controllability = models.SmallIntegerField('Контрольованість (1-5)', null=True, blank=True)

    SEARCH_MODE_RAG = 'rag'
    SEARCH_MODE_GPT = 'gpt'
    SEARCH_MODE_KEYWORD = 'keyword'
    SEARCH_MODE_CHOICES = [
        (SEARCH_MODE_RAG, 'RAG (семантичний пошук + GPT)'),
        (SEARCH_MODE_GPT, 'GPT-only (без бази)'),
        (SEARCH_MODE_KEYWORD, 'Keyword search (текстовий пошук)'),
    ]
    search_mode = models.CharField(
        'Режим пошуку',
        max_length=10,
        choices=SEARCH_MODE_CHOICES,
        null=True,
        blank=True,
    )

    class Meta:
        verbose_name = 'Лог запиту'
        verbose_name_plural = 'Логи запитів'
        ordering = ['-created_at']

    def __str__(self) -> str:
        return f'"{self.query[:50]}" ({self.created_at.strftime("%d.%m.%Y %H:%M")})'
