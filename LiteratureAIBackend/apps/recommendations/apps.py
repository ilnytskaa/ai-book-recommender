from django.apps import AppConfig


class RecommendationsConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.recommendations'
    verbose_name = 'Рекомендації'

    def ready(self) -> None:
        from core.container import Container

        container = Container()
        container.wire(modules=[
            'apps.books.views',
            'apps.recommendations.views',
        ])
