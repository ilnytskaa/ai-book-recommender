import pytest

from apps.books.models import Book


@pytest.mark.django_db
class TestBookModel:
    def test_str_representation(self):
        book = Book(title='Кобзар', author='Тарас Шевченко')
        assert str(book) == 'Кобзар — Тарас Шевченко'

    def test_has_embedding_false_by_default(self):
        book = Book(title='Test', author='Author', description='Desc', genre='Genre')
        assert book.has_embedding is False

    def test_has_embedding_true_when_set(self):
        book = Book(
            title='Test', author='Author', description='Desc', genre='Genre',
            embedding=[0.1] * 1536,
        )
        assert book.has_embedding is True

    def test_create_book(self):
        book = Book.objects.create(
            title='1984',
            author='Джордж Орвелл',
            description='Антиутопічний роман',
            genre='Антиутопія',
            year=1949,
            rating=4.8,
        )
        assert book.pk is not None
        assert book.title == '1984'
        assert book.year == 1949
