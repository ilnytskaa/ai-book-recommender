from django.contrib import admin

from .models import Book


@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ['title', 'author', 'genre', 'year', 'rating', 'has_embedding']
    list_filter = ['genre', 'year']
    search_fields = ['title', 'author', 'description']
    readonly_fields = ['created_at', 'updated_at']

    def has_embedding(self, obj: Book) -> bool:
        return obj.has_embedding
    has_embedding.boolean = True
    has_embedding.short_description = 'Ембедінг'
