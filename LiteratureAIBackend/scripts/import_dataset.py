"""
Import a CSV or JSON dataset file into the database with column mapping.

Usage:
    # Preview columns (no import)
    python scripts/import_dataset.py <file> --preview

    # Import with column mapping
    python scripts/import_dataset.py <file> --mapping title=<col>,author=<col>,description=<col>,genre=<col>

    # Import + generate embeddings
    python scripts/import_dataset.py <file> --mapping title=<col>,... --embeddings

Examples:
    python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv --preview

    python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv \\
        --mapping title=title,author=authors,description=description,genre=categories,year=published_year,rating=average_rating \\
        --embeddings

Notes:
    - File path is relative to the data/ folder.
    - Duplicates (same title + author) are skipped.
    - --embeddings calls OpenAI API for all books without an embedding.
      Requires OPENAI_API_KEY in .env.
"""
import argparse
import csv
import json
import logging
import os
import sys
from pathlib import Path

logging.basicConfig(level=logging.INFO, format='%(levelname)s %(message)s')
logger = logging.getLogger(__name__)

# ── Bootstrap Django ──────────────────────────────────────────────────────────
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

import django
django.setup()

from django.conf import settings
from apps.books.models import Book

_EMPTY = (None, '', 'null', 'None', 'none', 'NaN', 'nan')


# ── Preview ───────────────────────────────────────────────────────────────────

def preview(file_path: Path) -> None:
    rows, columns = _read_file(file_path)
    logger.info('Файл: %s', file_path)
    logger.info('Рядків: %d', len(rows))
    logger.info('Колонки (%d): %s', len(columns), columns)
    logger.info('')
    logger.info('Перші 3 рядки:')
    for row in rows[:3]:
        logger.info('  %s', dict(row))
    logger.info(
        '\nПриклад команди імпорту:\n'
        '  python scripts/import_dataset.py %s \\\n'
        '      --mapping title=<col>,author=<col>,description=<col>,genre=<col> \\\n'
        '      --embeddings',
        file_path.parent.name + '/' + file_path.name,
    )


# ── Import ────────────────────────────────────────────────────────────────────

def import_dataset(file_path: Path, mapping: dict, generate_embeddings: bool) -> None:
    rows, _ = _read_file(file_path)

    created = skipped = 0
    for i, row in enumerate(rows, start=1):
        book_data = _map_row(row, mapping)
        if book_data is None:
            continue

        db_defaults = {k: v for k, v in book_data.items() if k not in ('title', 'author')}
        _, is_new = Book.objects.get_or_create(
            title=book_data['title'],
            author=book_data['author'],
            defaults=db_defaults,
        )
        if is_new:
            created += 1
        else:
            skipped += 1

        if i % 500 == 0:
            logger.info('  Оброблено %d рядків...', i)

    logger.info('Імпорт завершено: %d створено, %d пропущено.', created, skipped)

    if generate_embeddings:
        _generate_embeddings()


def _map_row(row: dict, mapping: dict) -> dict | None:
    book: dict = {}
    for model_field, col_name in mapping.items():
        val = row.get(col_name)
        if val not in _EMPTY:
            book[model_field] = str(val).strip()

    if 'year' in book:
        try:
            book['year'] = int(float(book['year']))
        except (ValueError, TypeError):
            book.pop('year')

    if 'rating' in book:
        try:
            book['rating'] = float(book['rating'])
        except (ValueError, TypeError):
            book.pop('rating')

    if not all(book.get(f) for f in ('title', 'author', 'description', 'genre')):
        return None

    return book


# ── Embeddings ────────────────────────────────────────────────────────────────

def _generate_embeddings() -> None:
    if not settings.OPENAI_API_KEY:
        logger.warning('OPENAI_API_KEY не налаштовано — ембедінги пропущено.')
        return

    from openai import OpenAI
    client = OpenAI(api_key=settings.OPENAI_API_KEY)

    books = Book.objects.filter(embedding__isnull=True)
    total = books.count()

    if total == 0:
        logger.info('Усі книги вже мають ембедінги.')
        return

    logger.info('Генерація ембедінгів для %d книг...', total)
    embedded = 0

    for book in books:
        text = (
            f'Назва: {book.title}. Автор: {book.author}. '
            f'Жанр: {book.genre}. Опис: {book.description}'
        )
        try:
            response = client.embeddings.create(model=settings.EMBEDDING_MODEL, input=text)
            book.embedding = response.data[0].embedding
            book.save(update_fields=['embedding'])
            embedded += 1
            logger.info('[%d/%d] %s', embedded, total, book.title)
        except Exception as exc:
            logger.error('Помилка для "%s": %s', book.title, exc)

    logger.info('Ембедінги згенеровано: %d/%d', embedded, total)


# ── File parsing ──────────────────────────────────────────────────────────────

def _read_file(file_path: Path) -> tuple[list[dict], list[str]]:
    content = file_path.read_text(encoding='utf-8', errors='replace')
    if file_path.suffix.lower() == '.json':
        data = json.loads(content)
        if not isinstance(data, list):
            raise ValueError("JSON має бути масивом об'єктів.")
        columns = list(data[0].keys()) if data else []
        return data, columns
    else:
        rows = list(csv.DictReader(content.splitlines()))
        columns = list(rows[0].keys()) if rows else []
        return rows, columns


def _parse_mapping(raw: str) -> dict:
    result = {}
    for pair in raw.split(','):
        if '=' not in pair:
            raise ValueError(f'Невірний формат: "{pair}". Очікується key=value')
        model_field, _, col_name = pair.partition('=')
        result[model_field.strip()] = col_name.strip()
    return result


# ── Entry point ───────────────────────────────────────────────────────────────

if __name__ == '__main__':
    parser = argparse.ArgumentParser(
        description='Імпортує CSV/JSON датасет у БД з маппінгом колонок.',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog=__doc__,
    )
    parser.add_argument(
        'file',
        help='Шлях до файлу відносно папки data/',
    )
    parser.add_argument(
        '--preview',
        action='store_true',
        help='Показати колонки і перші рядки без імпорту',
    )
    parser.add_argument(
        '--mapping',
        default='',
        help='title=<col>,author=<col>,description=<col>,genre=<col>[,year=<col>,rating=<col>]',
    )
    parser.add_argument(
        '--embeddings',
        action='store_true',
        help='Генерувати OpenAI ембедінги після імпорту',
    )
    args = parser.parse_args()

    data_dir = Path(settings.DATASET_DIR)
    file_path = data_dir / args.file

    if not file_path.exists():
        logger.error('Файл не знайдено: %s', file_path)
        sys.exit(1)

    if args.preview:
        preview(file_path)
        sys.exit(0)

    if not args.mapping:
        logger.error('Потрібен --mapping або --preview.')
        sys.exit(1)

    try:
        mapping = _parse_mapping(args.mapping)
    except ValueError as exc:
        logger.error('%s', exc)
        sys.exit(1)

    required = {'title', 'author', 'description', 'genre'}
    missing = required - set(mapping.keys())
    if missing:
        logger.error("Маппінг не містить обов'язкових полів: %s", ', '.join(sorted(missing)))
        sys.exit(1)

    import_dataset(file_path, mapping, args.embeddings)
