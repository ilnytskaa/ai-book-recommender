import pytest
from unittest.mock import patch, MagicMock
from django.urls import reverse
from rest_framework.test import APIClient

from apps.books.models import Book


@pytest.fixture
def api_client():
    return APIClient()


@pytest.fixture
def sample_book(db):
    return Book.objects.create(
        title='1984',
        author='Джордж Орвелл',
        description='Антиутопічний роман про тоталітарне суспільство.',
        genre='Антиутопія',
        year=1949,
        rating=4.8,
    )


@pytest.mark.django_db
class TestBookListCreateView:
    def test_list_books(self, api_client, sample_book):
        response = api_client.get('/api/books/')
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        titles = [b['title'] for b in data]
        assert '1984' in titles

    def test_create_book_valid(self, api_client, db):
        payload = {
            'title': 'Дюна',
            'author': 'Френк Герберт',
            'description': 'Епічна наукова фантастика.',
            'genre': 'Наукова фантастика',
            'year': 1965,
            'rating': 4.6,
        }
        response = api_client.post('/api/books/', payload, format='json')
        assert response.status_code == 201
        assert response.json()['title'] == 'Дюна'

    def test_create_book_invalid_rating(self, api_client, db):
        payload = {
            'title': 'Test', 'author': 'Author',
            'description': 'Desc', 'genre': 'Genre',
            'rating': 10.0,
        }
        response = api_client.post('/api/books/', payload, format='json')
        assert response.status_code == 400

    def test_search_books(self, api_client, sample_book):
        response = api_client.get('/api/books/?search=Орвелл')
        assert response.status_code == 200
        data = response.json()
        assert any('1984' in b['title'] for b in data)


@pytest.mark.django_db
class TestBookDetailView:
    def test_get_existing_book(self, api_client, sample_book):
        response = api_client.get(f'/api/books/{sample_book.pk}/')
        assert response.status_code == 200
        assert response.json()['title'] == '1984'

    def test_get_nonexistent_book(self, api_client, db):
        response = api_client.get('/api/books/99999/')
        assert response.status_code == 404

    def test_delete_book(self, api_client, sample_book):
        response = api_client.delete(f'/api/books/{sample_book.pk}/')
        assert response.status_code == 204
        assert not Book.objects.filter(pk=sample_book.pk).exists()
