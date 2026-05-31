from django.urls import path

from .views import RecommendationView, SearchHistoryView, ComparisonStatsView

urlpatterns = [
    path('recommendations/', RecommendationView.as_view(), name='recommendations'),
    path('recommendations/history/', SearchHistoryView.as_view(), name='search-history'),
    path('recommendations/stats/', ComparisonStatsView.as_view(), name='comparison-stats'),
]
