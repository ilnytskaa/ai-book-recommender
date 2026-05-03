"""Books HTTP views — single responsibility: HTTP request/response handling."""
import logging

from dependency_injector.wiring import Provide, inject
from drf_spectacular.utils import extend_schema, OpenApiParameter
from rest_framework import status
from rest_framework.request import Request
from rest_framework.response import Response
from rest_framework.views import APIView

from core.container import Container
from core.exceptions import BookNotFoundError
from apps.books.serializers import BookSerializer, BookCreateSerializer, BookListSerializer
from apps.books.services.book_service import BookService

logger = logging.getLogger(__name__)


class BookListCreateView(APIView):
    """GET /api/books/  — list all books.
    POST /api/books/ — create a new book."""

    @inject
    def __init__(self, book_service: BookService = Provide[Container.book_service], **kwargs):
        super().__init__(**kwargs)
        self._service = book_service

    @extend_schema(
        summary='List books',
        parameters=[
            OpenApiParameter(name='search', description='Search by title, author, or description', required=False, type=str),
            OpenApiParameter(name='genre', description='Filter by genre', required=False, type=str),
        ],
        responses=BookListSerializer(many=True),
    )
    def get(self, request: Request) -> Response:
        genre = request.query_params.get('genre')
        search = request.query_params.get('search')

        if search:
            books = self._service.search_books(search)
        elif genre:
            books = self._service.list_books({'genre__iexact': genre})
        else:
            books = self._service.list_books()

        serializer = BookListSerializer(books, many=True)
        return Response(serializer.data)

    @extend_schema(
        summary='Create a book',
        request=BookCreateSerializer,
        responses=BookSerializer,
    )
    def post(self, request: Request) -> Response:
        serializer = BookCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        book = self._service.create_book(serializer.validated_data)
        return Response(BookSerializer(book).data, status=status.HTTP_201_CREATED)


class BookDetailView(APIView):
    """GET/PUT/DELETE /api/books/<id>/"""

    @inject
    def __init__(self, book_service: BookService = Provide[Container.book_service], **kwargs):
        super().__init__(**kwargs)
        self._service = book_service

    @extend_schema(summary='Get a book', responses=BookSerializer)
    def get(self, request: Request, book_id: int) -> Response:
        try:
            book = self._service.get_book(book_id)
        except BookNotFoundError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookSerializer(book).data)

    @extend_schema(summary='Update a book', request=BookCreateSerializer, responses=BookSerializer)
    def put(self, request: Request, book_id: int) -> Response:
        serializer = BookCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = self._service.update_book(book_id, serializer.validated_data)
        except BookNotFoundError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookSerializer(book).data)

    @extend_schema(summary='Partially update a book', request=BookCreateSerializer, responses=BookSerializer)
    def patch(self, request: Request, book_id: int) -> Response:
        serializer = BookCreateSerializer(data=request.data, partial=True)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        try:
            book = self._service.update_book(book_id, serializer.validated_data)
        except BookNotFoundError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(BookSerializer(book).data)

    @extend_schema(summary='Delete a book', responses={204: None})
    def delete(self, request: Request, book_id: int) -> Response:
        try:
            self._service.delete_book(book_id)
        except BookNotFoundError as exc:
            return Response({'error': str(exc)}, status=status.HTTP_404_NOT_FOUND)
        return Response(status=status.HTTP_204_NO_CONTENT)


class BookStatsView(APIView):
    """GET /api/books/stats/ — database statistics."""

    @inject
    def __init__(self, book_service: BookService = Provide[Container.book_service], **kwargs):
        super().__init__(**kwargs)
        self._service = book_service

    @extend_schema(summary='Book statistics')
    def get(self, request: Request) -> Response:
        return Response(self._service.get_stats())
