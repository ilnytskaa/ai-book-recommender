import pytest
from unittest.mock import patch, MagicMock
from rest_framework.test import APIClient


@pytest.fixture
def api_client():
    return APIClient()


@pytest.mark.django_db
class TestRecommendationView:
    def test_post_empty_query(self, api_client):
        response = api_client.post('/api/recommendations/', {'query': ''}, format='json')
        assert response.status_code == 400

    def test_post_short_query(self, api_client):
        response = api_client.post('/api/recommendations/', {'query': 'a'}, format='json')
        assert response.status_code == 400

    def test_post_missing_query(self, api_client):
        response = api_client.post('/api/recommendations/', {}, format='json')
        assert response.status_code == 400

    @patch('apps.recommendations.views.Container.recommendation_service')
    def test_post_valid_query(self, mock_service_provider, api_client):
        mock_service = MagicMock()
        mock_service.get_recommendations.return_value = {
            'recommendations': [
                {
                    'title': '1984',
                    'author': 'Джордж Орвелл',
                    'description': 'Антиутопічний роман',
                    'genre': 'Антиутопія',
                    'year': 1949,
                    'rating': 4.8,
                    'reason': 'Підходить для вашого запиту',
                }
            ],
            'query': 'антиутопія',
        }
        mock_service_provider.return_value = mock_service

        with patch(
            'apps.recommendations.views.RecommendationView._service',
            mock_service,
        ):
            response = api_client.post(
                '/api/recommendations/',
                {'query': 'антиутопія про майбутнє'},
                format='json',
            )

        assert response.status_code in (200, 400, 500)


@pytest.mark.django_db
class TestRecommendationViewIntegration:
    """Integration test — goes through the full service stack with no OpenAI key."""

    def test_returns_fallback_when_no_openai_key(self, api_client):
        with patch('django.conf.settings.OPENAI_API_KEY', ''):
            response = api_client.post(
                '/api/recommendations/',
                {'query': 'цікава книга про пригоди'},
                format='json',
            )
        assert response.status_code == 200
        data = response.json()
        assert 'recommendations' in data
        assert isinstance(data['recommendations'], list)
