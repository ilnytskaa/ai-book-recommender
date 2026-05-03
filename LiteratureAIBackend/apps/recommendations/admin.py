from django.contrib import admin

from .models import SearchQueryLog


@admin.register(SearchQueryLog)
class SearchQueryLogAdmin(admin.ModelAdmin):
    list_display = ['query_preview', 'results_count', 'used_rag', 'used_fallback',
                    'processing_time_ms', 'created_at']
    list_filter = ['used_rag', 'used_fallback', 'created_at']
    readonly_fields = ['created_at']

    def query_preview(self, obj: SearchQueryLog) -> str:
        return obj.query[:60] + ('...' if len(obj.query) > 60 else '')
    query_preview.short_description = 'Запит'
