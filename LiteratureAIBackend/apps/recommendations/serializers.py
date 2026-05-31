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
    search_mode = serializers.ChoiceField(
        choices=['rag', 'gpt', 'keyword'],
        default='rag',
    )


class BookRecommendationSerializer(serializers.Serializer):
    title = serializers.CharField()
    author = serializers.CharField()
    description = serializers.CharField()
    genre = serializers.CharField()
    year = serializers.IntegerField(required=False, allow_null=True)
    rating = serializers.FloatField(required=False, allow_null=True)
    reason = serializers.CharField()
    in_local_db = serializers.BooleanField(default=False)


class QualityScoreSerializer(serializers.Serializer):
    relevance = serializers.IntegerField()
    explainability = serializers.IntegerField()
    db_binding = serializers.IntegerField()
    hallucination_risk = serializers.CharField()


class RecommendationResponseSerializer(serializers.Serializer):
    recommendations = BookRecommendationSerializer(many=True)
    query = serializers.CharField()
    search_mode = serializers.CharField()
    not_found = serializers.BooleanField(default=False)
    note = serializers.CharField(required=False, allow_null=True, allow_blank=True)
    quality_score = QualityScoreSerializer(required=False)


class SearchQueryLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SearchQueryLog
        fields = ['id', 'query', 'results_count', 'used_rag', 'used_fallback',
                  'processing_time_ms', 'created_at']


class ModeStatsSerializer(serializers.Serializer):
    count = serializers.IntegerField()
    relevance = serializers.FloatField(allow_null=True)
    explainability = serializers.FloatField(allow_null=True)
    db_binding = serializers.FloatField(allow_null=True)
    controllability = serializers.FloatField(allow_null=True)


class ComparisonStatsSerializer(serializers.Serializer):
    rag = ModeStatsSerializer()
    gpt = ModeStatsSerializer()
    keyword = ModeStatsSerializer()
