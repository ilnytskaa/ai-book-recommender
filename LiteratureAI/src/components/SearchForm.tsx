'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, BookOpen, Star, Calendar, User, Info, Heart, Database, Brain } from 'lucide-react';
import SearchAnimation from './SearchAnimation';
import { addToSearchHistory } from './SearchHistory';
import { addToWishlist } from './Wishlist';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

interface BookRecommendation {
  title: string;
  author: string;
  description: string;
  genre: string;
  year?: number;
  rating?: number;
  reason: string;
}

interface ApiResponse {
  recommendations: BookRecommendation[];
  query: string;
  used_rag: boolean;
  note?: string;
}

interface SearchFormProps {
  initialQuery?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export default function SearchForm({ initialQuery = '' }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [useRag, setUseRag] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [usedRag, setUsedRag] = useState<boolean | null>(null);
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const { t } = useLanguage();
  const { addFavoriteBook } = useAuth();

  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setError('');
    setRecommendations([]);
    setNote('');
    setUsedRag(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/recommendations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, use_rag: useRag }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || 'Помилка при отриманні рекомендацій');
      }

      const data: ApiResponse = await response.json();
      setRecommendations(data.recommendations);
      setUsedRag(data.used_rag);
      if (data.note) setNote(data.note);

      addToSearchHistory(query, data.recommendations.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Щось пішло не так');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToWishlist = (book: BookRecommendation) => {
    const success = addToWishlist(book.title, book.author, book.genre, book.year);
    if (success) {
      addFavoriteBook({
        id: Date.now().toString(),
        title: book.title,
        author: book.author,
        rating: book.rating,
      });
      alert(`"${book.title}" додано до списку бажань та улюблених!`);
    } else {
      alert(`"${book.title}" вже є в списку бажань.`);
    }
  };

  return (
    <div className="w-full">
      {/* RAG toggle */}
      <div className="flex items-center justify-between mb-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center space-x-3">
          {useRag ? (
            <Database className="w-5 h-5 text-blue-500" />
          ) : (
            <Brain className="w-5 h-5 text-purple-500" />
          )}
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">
              {useRag ? 'RAG — пошук по базі даних' : 'GPT — без бази даних'}
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              {useRag
                ? 'Семантичний пошук у власній БД + GPT для пояснень'
                : 'GPT відповідає лише зі своїх знань (до жовтня 2023)'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setUseRag(!useRag)}
          className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none ${
            useRag ? 'bg-blue-500' : 'bg-purple-500'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
              useRag ? 'translate-x-7' : 'translate-x-1'
            }`}
          />
        </button>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="relative text-blue-500">
          <div className="left-0 absolute inset-y-0 flex items-center pl-4 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('form.search')}
            className="dark:bg-gray-700 shadow-lg py-4 pr-32 pl-12 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-2xl focus:ring-2 focus:ring-blue-500 w-full dark:text-white text-lg"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="top-2 right-2 bottom-2 absolute flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-6 rounded-xl text-white transition-colors disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">
              {isLoading ? t('msg.loading') : t('btn.search')}
            </span>
          </button>
        </div>
      </form>

      {/* Mode badge after search */}
      {usedRag !== null && (
        <div className={`flex items-center space-x-2 mb-4 px-4 py-2 rounded-full w-fit text-sm font-medium ${
          usedRag
            ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200'
            : 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200'
        }`}>
          {usedRag ? (
            <><Database className="w-4 h-4" /><span>Результати з бази даних (RAG)</span></>
          ) : (
            <><Brain className="w-4 h-4" /><span>Результати від GPT (без RAG)</span></>
          )}
        </div>
      )}

      {note && (
        <div className="bg-blue-50 dark:bg-blue-900/50 mb-6 p-4 border border-blue-200 dark:border-blue-800 rounded-lg">
          <div className="flex items-start space-x-2">
            <Info className="flex-shrink-0 mt-0.5 w-5 h-5 text-blue-600 dark:text-blue-400" />
            <p className="text-blue-800 dark:text-blue-200">{note}</p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      {isLoading && <SearchAnimation />}

      {recommendations.length > 0 && (
        <div className="space-y-6">
          <h3 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
            Рекомендації для вас:
          </h3>
          <div className="gap-6 grid">
            {recommendations.map((book, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 shadow-lg hover:shadow-xl p-6 border border-gray-100 dark:border-gray-700 rounded-2xl transition-shadow"
              >
                <div className="flex md:flex-row flex-col md:items-start md:space-x-6 space-y-4 md:space-y-0">
                  <div className="flex-shrink-0">
                    <div className="flex justify-center items-center bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg w-16 h-20">
                      <BookOpen className="w-8 h-8 text-white" />
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex sm:flex-row flex-col sm:justify-between sm:items-start mb-3">
                      <div>
                        <h4 className="mb-1 font-bold text-gray-900 dark:text-white text-xl">
                          {book.title}
                        </h4>
                        <div className="flex items-center mb-2 text-gray-600 dark:text-gray-400">
                          <User className="mr-1 w-4 h-4" />
                          <span>{book.author}</span>
                          {book.year && (
                            <>
                              <Calendar className="mr-1 ml-3 w-4 h-4" />
                              <span>{book.year}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {book.rating && (
                          <div className="flex items-center bg-yellow-50 dark:bg-yellow-900/30 px-3 py-1 rounded-full">
                            <Star className="mr-1 w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-yellow-700 dark:text-yellow-400 text-sm">
                              {book.rating > 5 ? (book.rating / 2).toFixed(1) : book.rating}/5
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => handleAddToWishlist(book)}
                          className="flex items-center space-x-1 bg-red-50 hover:bg-red-100 dark:bg-red-900/30 dark:hover:bg-red-900/50 px-3 py-1 rounded-full text-red-600 dark:text-red-400 transition-colors"
                          title="Додати до списку бажань"
                        >
                          <Heart className="w-4 h-4" />
                          <span className="text-sm">До бажань</span>
                        </button>
                      </div>
                    </div>

                    <div className="mb-3">
                      <span className="inline-block bg-blue-100 dark:bg-blue-900/50 px-3 py-1 rounded-full text-blue-800 dark:text-blue-200 text-sm">
                        {book.genre}
                      </span>
                    </div>

                    <p className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">
                      {book.description}
                    </p>

                    <div className="bg-blue-50 dark:bg-blue-900/30 p-4 border-blue-400 border-l-4 rounded-r-lg">
                      <p className="text-blue-800 dark:text-blue-200">
                        <strong>Чому ця книга для вас:</strong> {book.reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!isLoading && recommendations.length === 0 && !error && (
        <div className="bg-gray-50 dark:bg-gray-800 mt-12 p-8 rounded-2xl">
          <h4 className="mb-4 font-semibold text-gray-900 dark:text-white text-lg">
            Приклади запитів:
          </h4>
          <div className="gap-4 grid md:grid-cols-2">
            {[
              { label: 'Романтика + Подорожі', text: 'Хочу щось романтичне про подорожі в Європі' },
              { label: 'Сучасний детектив', text: 'Детектив з неочікуваним фіналом, щось сучасне' },
              { label: 'Sci-Fi про ШІ', text: 'Наукова фантастика про штучний інтелект' },
              { label: 'Книги 2024 року', text: 'Найкращі книги 2024 року' },
            ].map(({ label, text }) => (
              <button
                key={label}
                onClick={() => setQuery(text)}
                className="bg-white dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 p-4 border border-gray-200 dark:border-gray-600 rounded-lg text-left transition-colors"
              >
                <p className="font-medium text-blue-600 dark:text-blue-400">{label}</p>
                <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
