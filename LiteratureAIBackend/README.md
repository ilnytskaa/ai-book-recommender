# LiteratureAI — Backend

Python Django REST Framework backend для системи рекомендацій книг на основі RAG (Retrieval-Augmented Generation).

## Архітектура

```
LiteratureAIBackend/
├── config/                  # Django конфігурація
│   ├── settings/
│   │   ├── base.py          # Спільні налаштування
│   │   ├── development.py   # Dev оточення
│   │   └── production.py    # Production оточення
│   └── urls.py              # Головні URL
├── core/                    # SOLID ядро
│   ├── interfaces/          # Абстрактні інтерфейси (DIP)
│   │   ├── repository.py    # IRepository, IReadRepository, IWriteRepository
│   │   └── service.py       # IBookService, IEmbeddingService, IRAGService ...
│   ├── container.py         # DI контейнер (dependency-injector)
│   └── exceptions.py        # Доменні виключення
├── apps/
│   ├── books/               # Додаток управління книгами
│   │   ├── models.py        # Book (pgvector embedding)
│   │   ├── serializers.py   # DRF серіалізатори
│   │   ├── views.py         # HTTP Views (DI-інʼєктовані сервіси)
│   │   ├── repositories/    # BookRepository (Repository Pattern)
│   │   └── services/        # BookService (Service Layer Pattern)
│   └── recommendations/     # RAG рекомендації
│       ├── models.py        # SearchQueryLog
│       ├── views.py         # RecommendationView
│       ├── services/
│       │   ├── embedding_service.py      # OpenAI Embeddings
│       │   ├── rag_service.py            # RAG + cosine similarity
│       │   └── recommendation_service.py # Orchestration + GPT
│       └── repositories/    # RecommendationRepository
├── scripts/
│   ├── seed_books.py        # Вбудований датасет — 50+ книг з описами українською
│   ├── download_dataset.py  # Завантажити датасет з Kaggle → data/
│   └── import_dataset.py    # Імпортувати CSV/JSON до БД з маппінгом колонок
├── data/                    # Датасети (у .gitignore)
└── docker-compose.yml       # PostgreSQL (pgvector) + API
```

## SOLID та паттерни

| Принцип | Реалізація |
|---------|-----------|
| **S** — Single Responsibility | Кожен клас має одну відповідальність (Repository → DB, Service → логіка, View → HTTP) |
| **O** — Open/Closed | Сервіси реалізують абстрактні інтерфейси — нові стратегії додаються без зміни існуючих класів |
| **L** — Liskov Substitution | `OpenAIEmbeddingService` підставляється через `IEmbeddingService` |
| **I** — Interface Segregation | `IReadRepository` / `IWriteRepository` розділені |
| **D** — Dependency Inversion | DI контейнер `core/container.py` — всі залежності через абстракції |

**Паттерни:**
- **Repository Pattern** — `BookRepository`, `RecommendationRepository`
- **Service Layer** — `BookService`, `RecommendationService`
- **Strategy Pattern** — `RAGService` (semantic search → keyword fallback)
- **Factory Pattern** — DI контейнер як фабрика сервісів

## RAG підхід

```
Запит користувача
      │
      ▼
OpenAI Embeddings API  ──►  query_vector (1536 dim)
      │
      ▼
pgvector cosine similarity search
      │  (знаходить top-8 найрелевантніших книг)
      ▼
OpenAI GPT-4o-mini
  prompt = query + 8 books context
      │
      ▼
3-5 персоналізованих рекомендацій з поясненням
```

**Перевага RAG:** замість надсилання всіх книг до AI (~50 000 токенів),
надсилається лише top-8 релевантних (~2 000 токенів). Це у 25x дешевше і швидше.

## API Endpoints

| Method | URL | Опис |
|--------|-----|------|
| `POST` | `/api/recommendations/` | Отримати рекомендації книг |
| `GET` | `/api/recommendations/history/` | Історія пошуків |
| `GET` | `/api/books/` | Список книг (з пошуком і фільтром) |
| `POST` | `/api/books/` | Додати книгу |
| `GET` | `/api/books/<id>/` | Деталі книги |
| `PUT` | `/api/books/<id>/` | Оновити книгу |
| `PATCH` | `/api/books/<id>/` | Часткове оновлення |
| `DELETE` | `/api/books/<id>/` | Видалити книгу |
| `GET` | `/api/books/stats/` | Статистика БД |

### POST /api/recommendations/

**Request:**
```json
{
  "query": "Хочу щось романтичне з елементами пригод"
}
```

**Response:**
```json
{
  "recommendations": [
    {
      "title": "Граф Монте-Крісто",
      "author": "Александр Дюма",
      "description": "...",
      "genre": "Пригодницький роман",
      "year": 1844,
      "rating": 4.7,
      "reason": "Поєднує романтику та пригоди саме так, як ви описали..."
    }
  ],
  "query": "Хочу щось романтичне з елементами пригод"
}
```

## Датасет для RAG

Рекомендований датасет: **[dylanjcastillo/7k-books-with-metadata](https://www.kaggle.com/datasets/dylanjcastillo/7k-books-with-metadata)**

~7 000 книг з повними описами, жанрами і рейтингами — ідеально для ембедінгів.

| Колонка у файлі | Поле моделі |
|-----------------|-------------|
| `title` | `title` |
| `authors` | `author` |
| `description` | `description` |
| `categories` | `genre` |
| `published_year` | `year` |
| `average_rating` | `rating` |

### Крок 1 — Завантажити

```bash
python scripts/download_dataset.py dylanjcastillo/7k-books-with-metadata
```

Потрібні змінні у `.env`:
```
KAGGLE_USERNAME=your_username
KAGGLE_KEY=your_api_key
```

Ключ: [kaggle.com/settings](https://www.kaggle.com/settings) → API → **Create New Token**.

### Крок 2 — Переглянути колонки (опціонально)

```bash
python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv --preview
```

### Крок 3 — Імпортувати до БД з ембедінгами

```bash
python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv \
    --mapping title=title,author=authors,description=description,genre=categories,year=published_year,rating=average_rating \
    --embeddings
```

- `--mapping` — зіставлення полів моделі з колонками файлу. Обов'язкові: `title`, `author`, `description`, `genre`
- `--embeddings` — генерує OpenAI ембедінги для всіх нових книг після імпорту
- Дублікати (однакові title + author) пропускаються автоматично

> Файли датасетів зберігаються у `data/` — папка додана до `.gitignore`.

---

## Вбудований датасет (seed)

50+ класичних книг з описами українською — для швидкого старту без Kaggle:

```bash
python scripts/seed_books.py --embeddings
```

---

## Запуск через Docker

```bash
# 1. Скопіювати і налаштувати .env
cp .env.example .env

# 2. Запустити контейнери
docker-compose up --build

# 3. Завантажити датасет і заповнити БД
docker-compose exec api python scripts/download_dataset.py dylanjcastillo/7k-books-with-metadata
docker-compose exec api python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv \
    --mapping title=title,author=authors,description=description,genre=categories,year=published_year,rating=average_rating \
    --embeddings

# АБО використати вбудований seed (50+ книг)
docker-compose exec api python scripts/seed_books.py --embeddings

# 4. Створити суперкористувача Django Admin
docker-compose exec api python manage.py createsuperuser
```

API буде доступний на http://localhost:8000

## Локальний запуск (без Docker)

```bash
# 1. Встановити залежності
pip install -r requirements.txt

# 2. Налаштувати .env
cp .env.example .env

# 3. Запустити PostgreSQL з pgvector
docker run -d --name pgvector -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgvector/pgvector:pg16

# 4. Виконати міграції
python manage.py migrate

# 5. Завантажити датасет і заповнити БД
python scripts/download_dataset.py dylanjcastillo/7k-books-with-metadata
python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv \
    --mapping title=title,author=authors,description=description,genre=categories,year=published_year,rating=average_rating \
    --embeddings

# 6. Запустити сервер
python manage.py runserver
```

## Тести

```bash
# Всі тести з покриттям
pytest

# Тільки books
pytest apps/books/tests/

# Тільки recommendations
pytest apps/recommendations/tests/

# HTML звіт покриття
pytest --cov=apps --cov-report=html
```

## Django Admin

Доступний на http://localhost:8000/admin/

- **Книги** — перегляд, пошук, фільтрація книг у БД
- **Логи запитів** — аналітика: кількість запитів, RAG vs fallback, час відповіді

## Підключення Frontend

У файлі `LiteratureAI/.env`:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Змінні оточення

| Змінна | Опис | За замовчуванням |
|--------|------|-----------------|
| `SECRET_KEY` | Django secret key | *(обов'язково у prod)* |
| `DEBUG` | Режим відлагодження | `True` |
| `DB_NAME` | Назва БД | `literature_ai` |
| `DB_USER` | Користувач БД | `postgres` |
| `DB_PASSWORD` | Пароль БД | `postgres` |
| `DB_HOST` | Хост БД | `localhost` |
| `DB_PORT` | Порт БД | `5432` |
| `OPENAI_API_KEY` | Ключ OpenAI API | *(порожньо = без ембедінгів)* |
| `KAGGLE_USERNAME` | Kaggle username | *(потрібен для download_dataset.py)* |
| `KAGGLE_KEY` | Kaggle API key | *(потрібен для download_dataset.py)* |
| `CORS_ALLOWED_ORIGINS` | Дозволені CORS origins | `http://localhost:3000` |
