import pytest
from unittest.mock import MagicMock

from apps.books.services.book_service import BookService
from apps.books.models import Book
from core.exceptions import BookNotFoundError


@pytest.fixture
def mock_repo():
    return MagicMock()


@pytest.fixture
def service(mock_repo):
    return BookService(book_repository=mock_repo)


class TestBookService:
    def test_get_book_found(self, service, mock_repo):
        book = Book(id=1, title='Test', author='Author')
        mock_repo.get_by_id.return_value = book
        result = service.get_book(1)
        assert result == book
        mock_repo.get_by_id.assert_called_once_with(1)

    def test_get_book_not_found(self, service, mock_repo):
        mock_repo.get_by_id.return_value = None
        with pytest.raises(BookNotFoundError):
            service.get_book(999)

    def test_list_books_no_filter(self, service, mock_repo):
        books = [Book(id=1), Book(id=2)]
        mock_repo.get_all.return_value = books
        result = service.list_books()
        assert result == books

    def test_list_books_with_filter(self, service, mock_repo):
        books = [Book(id=1, genre='Фентезі')]
        mock_repo.filter.return_value = books
        result = service.list_books({'genre__iexact': 'Фентезі'})
        mock_repo.filter.assert_called_once_with(genre__iexact='Фентезі')
        assert result == books

    def test_create_book(self, service, mock_repo):
        book = Book(id=1, title='New', author='Author')
        mock_repo.create.return_value = book
        result = service.create_book({'title': 'New', 'author': 'Author'})
        assert result == book

    def test_delete_book_not_found(self, service, mock_repo):
        mock_repo.delete.return_value = False
        with pytest.raises(BookNotFoundError):
            service.delete_book(999)

    def test_get_stats(self, service, mock_repo):
        mock_repo.count.return_value = 50
        mock_repo.count_with_embeddings.return_value = 40
        stats = service.get_stats()
        assert stats == {'total': 50, 'with_embeddings': 40}

    def test_search_empty_query(self, service, mock_repo):
        result = service.search_books('  ')
        assert result == []
        mock_repo.search_by_text.assert_not_called()
