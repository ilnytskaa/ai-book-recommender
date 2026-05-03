from rest_framework import serializers

from .models import Book


class BookSerializer(serializers.ModelSerializer):
    has_embedding = serializers.ReadOnlyField()

    class Meta:
        model = Book
        fields = [
            'id', 'title', 'author', 'description',
            'genre', 'year', 'rating', 'has_embedding',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class BookCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Book
        fields = ['title', 'author', 'description', 'genre', 'year', 'rating']

    def validate_rating(self, value):
        if value is not None and not (0.0 <= value <= 5.0):
            raise serializers.ValidationError('Рейтинг має бути від 0 до 5.')
        return value

    def validate_year(self, value):
        if value is not None and not (-3000 <= value <= 2100):
            raise serializers.ValidationError('Рік має бути у діапазоні від -3000 до 2100.')
        return value


class BookListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list endpoints."""

    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'year', 'rating']
