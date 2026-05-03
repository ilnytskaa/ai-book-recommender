from django.apps import AppConfig


class RecommendationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.recommendations'
    verbose_name = 'Рекомендації'

    def ready(self) -> None:
        from core.container import Container
        from django.conf import settings

        container = Container()
        container.config.from_dict({
            'openai_api_key': settings.OPENAI_API_KEY,
            'embedding_model': settings.EMBEDDING_MODEL,
            'recommendation_model': settings.RECOMMENDATION_MODEL,
            'rag_top_k': settings.RAG_TOP_K,
        })
        container.wire(modules=[
            'apps.books.views',
            'apps.recommendations.views',
        ])
