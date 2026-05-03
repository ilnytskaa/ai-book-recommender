from rest_framework import serializers

from .models import SearchQueryLog


class RecommendationRequestSerializer(serializers.Serializer):
    query = serializers.CharField(
        min_length=2,
        max_length=1000,
        error_messages={
            'blank': 'Request can not be blank.',
            'min_length': 'Request too short (minumum 2 symbols).',
            'max_length': 'Request too long (maximun 1000 symbols).',
        }
    )
    use_rag = serializers.BooleanField(default=True)


class BookRecommendationSerializer(serializers.Serializer):
    title = serializers.CharField()
    author = serializers.CharField()
    description = serializers.CharField()
    genre = serializers.CharField()
    year = serializers.IntegerField(required=False, allow_null=True)
    rating = serializers.FloatField(required=False, allow_null=True)
    reason = serializers.CharField()


class RecommendationResponseSerializer(serializers.Serializer):
    recommendations = BookRecommendationSerializer(many=True)
    query = serializers.CharField()
    note = serializers.CharField(required=False, allow_null=True, allow_blank=True)


class SearchQueryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchQueryLog
        fields = ['id', 'query', 'results_count', 'used_rag', 'used_fallback',
                  'processing_time_ms', 'created_at']
