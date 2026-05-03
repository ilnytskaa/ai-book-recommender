# LiteratureAI — Backend

Python async Django REST Framework backend для системи рекомендацій книг на основі RAG (Retrieval-Augmented Generation).

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
│       ├── views.py         # RecommendationView (async-ready)
│       ├── services/
│       │   ├── embedding_service.py     # OpenAI Embeddings
│       │   ├── rag_service.py           # RAG + cosine similarity
│       │   └── recommendation_service.py # Orchestration + GPT
│       └── repositories/    # RecommendationRepository
├── scripts/
│   └── seed_books.py        # 50+ книг з описами українською
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
OpenAI GPT-3.5-turbo
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

## Запуск через Docker

```bash
# 1. Скопіювати і налаштувати .env
cp .env.example .env
# Відкрийте .env і заповніть OPENAI_API_KEY, DB_PASSWORD тощо

# 2. Запустити контейнери
docker-compose up --build

# 3. Заповнити базу даних книгами
docker-compose exec api python scripts/seed_books.py

# 4. Згенерувати ембедінги (потрібен OpenAI API ключ)
docker-compose exec api python scripts/seed_books.py --embeddings

# 5. Створити суперкористувача Django Admin
docker-compose exec api python manage.py createsuperuser
```

API буде доступний на http://localhost:8000

## Локальний запуск (без Docker)

```bash
# 1. Створити та активувати venv
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate

# 2. Встановити залежності
pip install -r requirements.txt

# 3. Налаштувати .env
cp .env.example .env
# Заповніть DB_HOST=localhost та інші параметри

# 4. Переконайтесь що PostgreSQL запущено з pgvector розширенням:
# docker run -d --name pgvector -e POSTGRES_PASSWORD=postgres -p 5432:5432 pgvector/pgvector:pg16

# 5. Виконати міграції
python manage.py migrate

# 6. Заповнити БД
python scripts/seed_books.py --embeddings

# 7. Запустити сервер
python manage.py runserver
```

## Тести

```bash
# Запустити всі тести з покриттям
pytest

# Тільки тести books
pytest apps/books/tests/

# Тільки тести recommendations
pytest apps/recommendations/tests/

# Покриття у HTML
pytest --cov=apps --cov-report=html
```

## Підключення Frontend

У файлі `LiteratureAI/.env` додайте:
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Компонент `SearchForm.tsx` вже оновлений для використання цієї змінної.

## Django Admin

Доступний на http://localhost:8000/admin/

- **Книги** — перегляд, пошук, фільтрація книг у БД
- **Логи запитів** — аналітика: скільки запитів, RAG vs fallback, час відповіді

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
| `OPENAI_API_KEY` | Ключ OpenAI API | *(порожньо = fallback)* |
| `CORS_ALLOWED_ORIGINS` | Дозволені CORS origins | `http://localhost:3000` |
