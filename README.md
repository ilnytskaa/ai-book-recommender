# LiteratureAI — інтелектуальна система тематичного підбору літератури

**LiteratureAI** — вебзастосунок для тематичного підбору літератури з використанням трьох підходів: `keyword search`, `GPT-only` та `RAG` (Retrieval-Augmented Generation).

Система дозволяє користувачеві сформулювати запит природною мовою, обрати режим роботи та отримати список рекомендованих книг із поясненням вибору. Проєкт реалізовано з метою порівняння ефективності простого пошуку за ключовими словами, ізольованого використання ChatGPT та RAG-підходу, у якому відповідь мовної моделі підсилюється даними з локальної бази книг.

---

## Автор

* **ПІБ**: Жданюк Ірина Анатоліївна
* **Група**: ФеС-42
* **Керівник**: Жишкович А. В.
* **Рік виконання**: 2026

---

## Загальна інформація

* **Тип проєкту**: вебзастосунок
* **Призначення**: тематичний підбір літератури за користувацьким запитом
* **Основна ідея**: порівняння `keyword search`, `GPT-only` та `RAG`
* **Backend**: Python, Django REST Framework
* **Frontend**: Next.js, React, TypeScript
* **База даних**: PostgreSQL з підтримкою `pgvector`
* **AI-інтеграція**: OpenAI API
* **Контейнеризація**: Docker, Docker Compose
* **Тестування**: pytest

---

## Опис функціоналу

Система реалізує такі основні можливості:

* перегляд списку книг, збережених у базі даних;
* імпорт книжкових даних із датасету;
* збереження описів, жанрів, авторів, рейтингів та embedding-представлень книг;
* тематичний підбір літератури за запитом користувача;
* робота у трьох режимах:

  * `keyword search` — пошук за ключовими словами у локальній базі;
  * `GPT-only` — формування відповіді лише за допомогою ChatGPT без локального контексту;
  * `RAG` — пошук релевантних книг у базі та передавання їх як контексту до ChatGPT;
* формування пояснень до рекомендованих книг;
* логування запитів користувачів;
* перегляд історії пошуків;
* перегляд статистики ефективності підходів;
* взаємодія frontend і backend через REST API;
* автоматизоване тестування backend-модулів.

---

## Структура проєкту

```text
ai-book-recommender/
├── LiteratureAI/                    # Frontend-частина проєкту
│   ├── app/                         # Основні сторінки застосунку
│   ├── components/                  # UI-компоненти
│   ├── lib/                         # Допоміжна логіка
│   ├── public/                      # Статичні файли
│   ├── package.json                 # Залежності frontend
│   └── README.md
│
├── LiteratureAIBackend/             # Backend-частина проєкту
│   ├── config/                      # Django-конфігурація
│   │   ├── settings/                # Налаштування середовищ
│   │   └── urls.py                  # Головні маршрути
│   │
│   ├── core/                        # Спільне ядро системи
│   │   ├── interfaces/              # Абстрактні інтерфейси
│   │   ├── container.py             # DI-контейнер
│   │   └── exceptions.py            # Доменні виключення
│   │
│   ├── apps/
│   │   ├── books/                   # Модуль роботи з книгами
│   │   │   ├── models.py            # Модель Book
│   │   │   ├── serializers.py       # Серіалізатори
│   │   │   ├── views.py             # API-представлення
│   │   │   ├── repositories/        # Робота з БД
│   │   │   ├── services/            # Бізнес-логіка
│   │   │   └── tests/               # Тести модуля
│   │   │
│   │   └── recommendations/         # Модуль рекомендацій
│   │       ├── models.py            # Модель SearchQueryLog
│   │       ├── views.py             # API рекомендацій
│   │       ├── services/            # Логіка RAG, embeddings, GPT
│   │       ├── repositories/        # Робота з логами запитів
│   │       └── tests/               # Тести модуля
│   │
│   ├── scripts/
│   │   ├── seed_books.py            # Вбудоване наповнення бази книгами
│   │   ├── download_dataset.py      # Завантаження датасету
│   │   └── import_dataset.py        # Імпорт CSV/JSON у базу даних
│   │
│   ├── docker-compose.yml           # Запуск backend і PostgreSQL
│   ├── Dockerfile                   # Docker-образ backend
│   ├── pyproject.toml               # Python-залежності
│   └── README.md
```

---

## Опис основних модулів і файлів

| Модуль / файл                                                                 | Призначення                                                                  |
| ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `LiteratureAI/`                                                               | 
Frontend-частина вебзастосунку                                               |
| `LiteratureAIBackend/apps/books/`                                             | 
Модуль для роботи з книжковими записами                                      |
| `LiteratureAIBackend/apps/books/models.py`                                    | 
Опис моделі книги, зокрема полів назви, автора, жанру, рейтингу та embedding |
| `LiteratureAIBackend/apps/books/views.py`                                     | 
API для отримання, створення, редагування та видалення книг                  |
| `LiteratureAIBackend/apps/recommendations/`                                   | 
Модуль формування рекомендацій                                               |
| `LiteratureAIBackend/apps/recommendations/services/embedding_service.py`      | 
Генерація embedding-представлень через OpenAI API                            |
| `LiteratureAIBackend/apps/recommendations/services/rag_service.py`            | 
Пошук релевантних книг і реалізація RAG-логіки                               |
| `LiteratureAIBackend/apps/recommendations/services/recommendation_service.py` | 
Загальна логіка формування рекомендацій                                      |
| `LiteratureAIBackend/scripts/seed_books.py`                                   | 
Наповнення бази вбудованим набором книг                                      |
| `LiteratureAIBackend/scripts/download_dataset.py`                             | 
Завантаження зовнішнього датасету                                            |
| `LiteratureAIBackend/scripts/import_dataset.py`                               | 
Імпорт книжкових записів у базу даних                                        |
| `docker-compose.yml`                                                          | 
Запуск backend і PostgreSQL у контейнерах                                    |
| `.env`                                                                        | 
Файл змінних оточення                                                        |

---

## Принцип роботи системи

Користувач вводить тематичний запит у вебінтерфейсі та обирає один із трьох режимів роботи.

У режимі `keyword search` backend виконує пошук у локальній базі даних за текстовими збігами у полях книги. Цей режим є простим і контрольованим, але залежить від наявності конкретних ключових слів у запиті.

У режимі `GPT-only` запит користувача передається до ChatGPT без додаткового контексту з локальної бази. Такий підхід добре працює з природномовними запитами, однак може формувати відповідь без опори на фактично наявні у системі книжкові записи.

У режимі `RAG` система спочатку знаходить релевантні книги у базі даних, а потім передає їх до ChatGPT як контекст. Це дозволяє поєднати переваги локального контрольованого джерела даних і природномовної генерації відповіді.

```text
Запит користувача
        ↓
Вибір режиму роботи
        ↓
Keyword search / GPT-only / RAG
        ↓
Обробка запиту backend-частиною
        ↓
База даних PostgreSQL та/або OpenAI API
        ↓
Формування рекомендацій
        ↓
Відображення результатів у вебінтерфейсі
```

---

## RAG-підхід

RAG (Retrieval-Augmented Generation) використовується для підвищення надійності рекомендацій. Замість того щоб повністю покладатися на відповідь мовної моделі, система спочатку виконує пошук релевантних книг у локальній базі даних.

Загальна послідовність роботи RAG:

```text
Запит користувача
        ↓
Генерація embedding для запиту
        ↓
Пошук найближчих книжкових записів у PostgreSQL / pgvector
        ↓
Формування контексту з релевантних книг
        ↓
Передавання запиту і контексту до OpenAI API
        ↓
Отримання пояснених рекомендацій
```

Перевага такого підходу полягає в тому, що ChatGPT формує відповідь не ізольовано, а на основі знайдених у базі даних книг. Це зменшує ризик вигаданих рекомендацій і робить результат більш контрольованим.

---

## API Endpoints

| Method   | URL                             | Опис                                     |
| -------- | ------------------------------- | ---------------------------------------- |
| `GET`    | `/api/books/`                   | Отримання списку книг                    |
| `POST`   | `/api/books/`                   | Додавання нової книги                    |
| `GET`    | `/api/books/<id>/`              | Отримання детальної інформації про книгу |
| `PUT`    | `/api/books/<id>/`              | Повне оновлення книги                    |
| `PATCH`  | `/api/books/<id>/`              | Часткове оновлення книги                 |
| `DELETE` | `/api/books/<id>/`              | Видалення книги                          |
| `GET`    | `/api/books/stats/`             | Отримання статистики бази книг           |
| `POST`   | `/api/recommendations/`         | Формування рекомендацій                  |
| `GET`    | `/api/recommendations/history/` | Отримання історії пошукових запитів      |

---

## Приклади API-запитів

### Отримання списку книг

**GET**

```text
/api/books/
```

Приклад відповіді:

```json
[
  {
    "id": 1,
    "title": "1984",
    "author": "Джордж Орвелл",
    "genre": "Антиутопія",
    "year": 1949,
    "rating": 4.8
  }
]
```

---

### Формування рекомендацій

**POST**

```text
/api/recommendations/
```

Приклад запиту:

```json
{
  "query": "Хочу щось романтичне з елементами пригод",
  "mode": "rag"
}
```

Приклад відповіді:

```json
{
  "query": "Хочу щось романтичне з елементами пригод",
  "mode": "rag",
  "recommendations": [
    {
      "title": "Граф Монте-Крісто",
      "author": "Александр Дюма",
      "genre": "Пригодницький роман",
      "year": 1844,
      "rating": 4.7,
      "reason": "Книга поєднує пригодницьку динаміку, драматичну історію та елементи романтичної лінії."
    }
  ]
}
```

---

### Приклад помилки

Якщо користувач надсилає порожній або некоректний запит, backend повертає повідомлення про помилку.

```json
{
  "error": "Query is required."
}
```

---

## Датасет для наповнення бази даних

Для наповнення бази даних може використовуватися датасет:

```text
dylanjcastillo/7k-books-with-metadata
```

Датасет містить книжкові записи з назвами, авторами, описами, жанрами та рейтингами. Ці дані використовуються для формування локальної бази книг і подальшого пошуку в режимах `keyword search` та `RAG`.

Основне зіставлення полів:

| Колонка датасету | Поле моделі   |
| ---------------- | ------------- |
| `title`          | `title`       |
| `authors`        | `author`      |
| `description`    | `description` |
| `categories`     | `genre`       |
| `published_year` | `year`        |
| `average_rating` | `rating`      |

Також у проєкті передбачено вбудований набір книжкових записів для швидкого запуску без зовнішнього датасету.

---

## Як запустити проєкт з нуля

### 1. Клонування репозиторію

```bash
git clone https://github.com/ilnytskaa/ai-book-recommender.git
cd ai-book-recommender
```

---

### 2. Налаштування backend

```bash
cd LiteratureAIBackend
cp .env.example .env
```

У файлі `.env` потрібно вказати основні змінні оточення:

```env
SECRET_KEY=your_secret_key
DEBUG=True
DB_NAME=literature_ai
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost
DB_PORT=5432
OPENAI_API_KEY=your_openai_api_key
CORS_ALLOWED_ORIGINS=http://localhost:3000
```

---

### 3. Запуск backend через Docker

```bash
docker-compose up --build
```

Після запуску backend API буде доступний за адресою:

```text
http://localhost:8000
```

---

### 4. Виконання міграцій

```bash
docker-compose exec api python manage.py migrate
```

---

### 5. Наповнення бази даних

Для швидкого запуску можна використати вбудований набір книг:

```bash
docker-compose exec api python scripts/seed_books.py --embeddings
```

Або завантажити та імпортувати зовнішній датасет:

```bash
docker-compose exec api python scripts/download_dataset.py dylanjcastillo/7k-books-with-metadata
```

```bash
docker-compose exec api python scripts/import_dataset.py dylanjcastillo_7k-books-with-metadata/books.csv \
  --mapping title=title,author=authors,description=description,genre=categories,year=published_year,rating=average_rating \
  --embeddings
```

---

### 6. Створення адміністратора Django

```bash
docker-compose exec api python manage.py createsuperuser
```

Django Admin буде доступний за адресою:

```text
http://localhost:8000/admin/
```

---

### 7. Налаштування frontend

```bash
cd ../LiteratureAI
```

Створити файл `.env` або `.env.local` і вказати адресу backend API:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Встановити залежності:

```bash
npm install
```

Запустити frontend:

```bash
npm run dev
```

Frontend буде доступний за адресою:

```text
http://localhost:3000
```

---

## Локальний запуск backend без Docker

За потреби backend можна запустити локально.

```bash
cd LiteratureAIBackend
cp .env.example .env
pip install -r requirements.txt
```

Запустити PostgreSQL з підтримкою `pgvector`:

```bash
docker run -d --name pgvector \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

Виконати міграції:

```bash
python manage.py migrate
```

Заповнити базу даних:

```bash
python scripts/seed_books.py --embeddings
```

Запустити сервер:

```bash
python manage.py runserver
```

---

## Інструкція для користувача

1. Відкрити вебзастосунок у браузері.
2. Ввести тематичний запит, наприклад:
   `Хочу прочитати щось атмосферне, містичне і не дуже складне`.
3. Обрати режим роботи:

   * `keyword search`;
   * `GPT-only`;
   * `RAG`.
4. Натиснути кнопку формування рекомендацій.
5. Переглянути список рекомендованих книг.
6. Ознайомитися з поясненням, чому система запропонувала саме ці книги.
7. За потреби змінити режим роботи та порівняти результати.
8. Переглянути статистику ефективності підходів, якщо вона доступна в інтерфейсі.

---

## Django Admin

Django Admin використовується для перевірки та керування даними системи.

Адреса:

```text
http://localhost:8000/admin/
```

В адміністративній панелі можна переглядати:

* список книг;
* авторів, жанри, роки видання та рейтинги;
* наявність embedding-представлень;
* журнали пошукових запитів;
* результати роботи різних режимів рекомендацій.

---

## Тестування

Для запуску автоматизованих тестів використовується `pytest`.

Запуск усіх тестів:

```bash
pytest
```

Запуск тестів модуля книг:

```bash
pytest apps/books/tests/
```

Запуск тестів модуля рекомендацій:

```bash
pytest apps/recommendations/tests/
```

Формування HTML-звіту покриття:

```bash
pytest --cov=apps --cov-report=html
```

Результати тестування дозволяють перевірити роботу backend API, модулів книг, рекомендаційної логіки та коректність обробки запитів.

---

## Змінні оточення

| Змінна                 | Опис                         | Приклад                 |
| ---------------------- | ---------------------------- | ----------------------- |
| `SECRET_KEY`           | Секретний ключ Django        | `your_secret_key`       |
| `DEBUG`                | Режим відлагодження          | `True`                  |
| `DB_NAME`              | Назва бази даних             | `literature_ai`         |
| `DB_USER`              | Користувач бази даних        | `postgres`              |
| `DB_PASSWORD`          | Пароль бази даних            | `postgres`              |
| `DB_HOST`              | Хост бази даних              | `localhost`             |
| `DB_PORT`              | Порт бази даних              | `5432`                  |
| `OPENAI_API_KEY`       | Ключ OpenAI API              | `your_openai_api_key`   |
| `KAGGLE_USERNAME`      | Ім’я користувача Kaggle      | `your_username`         |
| `KAGGLE_KEY`           | API-ключ Kaggle              | `your_kaggle_key`       |
| `CORS_ALLOWED_ORIGINS` | Дозволені джерела frontend   | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL`  | URL backend API для frontend | `http://localhost:8000` |

---

## Типові проблеми та способи вирішення

## Типові проблеми та способи вирішення

### Docker не запускається
**Причина:** Docker Desktop призупинений або не відкритий.  
**Рішення:** відкрити Docker Desktop і запустити контейнери повторно.

### Backend не підключається до БД
**Причина:** PostgreSQL не запущений або неправильно вказані змінні `.env`.  
**Рішення:** перевірити `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`.

### Відсутні рекомендації
**Причина:** база книг не заповнена.  
**Рішення:** запустити `seed_books.py` або імпорт датасету.

### Не працює RAG
**Причина:** немає embedding-представлень або не заданий `OPENAI_API_KEY`.  
**Рішення:** додати ключ `OPENAI_API_KEY` і повторно згенерувати embeddings.

### Помилка CORS
**Причина:** Frontend URL не додано до дозволених джерел.  
**Рішення:** перевірити `CORS_ALLOWED_ORIGINS`.

### Frontend не отримує дані
**Причина:** неправильний URL backend.  
**Рішення:** перевірити `NEXT_PUBLIC_API_URL`.

### Помилка 400 при запиті рекомендацій
**Причина:** порожній або некоректний запит.  
**Рішення:** передати непорожній текст запиту.

---

## Використані технології

* Python
* Django
* Django REST Framework
* PostgreSQL
* pgvector
* OpenAI API
* Next.js
* React
* TypeScript
* Docker
* Docker Compose
* pytest
* Kaggle dataset

---

## Використані джерела

* Django Documentation
* Django REST Framework Documentation
* PostgreSQL Documentation
* pgvector Documentation
* OpenAI API Documentation
* Next.js Documentation
* React Documentation
* Kaggle Dataset: `dylanjcastillo/7k-books-with-metadata`

---

## Посилання на репозиторій

https://github.com/ilnytskaa/ai-book-recommender

## Releases

Версія `v1.0` доступна за посиланням: https://github.com/ilnytskaa/ai-book-recommender/releases/tag/v1.0

