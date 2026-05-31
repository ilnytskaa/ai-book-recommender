'use client';

import { useState, useEffect } from 'react';
import { Search, Loader2, BookOpen, Star, Calendar, User, Info, Heart, Database, Brain, CheckCircle, XCircle, SearchX } from 'lucide-react';
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
  in_local_db?: boolean;
}

type SearchMode = 'rag' | 'gpt' | 'keyword';

interface QualityScore {
  relevance: number;
  explainability: number;
  db_binding: number;
  hallucination_risk: 'відсутній' | 'низький' | 'середній' | 'високий';
}

interface ApiResponse {
  recommendations: BookRecommendation[];
  query: string;
  search_mode: SearchMode;
  not_found?: boolean;
  note?: string;
  quality_score?: QualityScore;
}

interface SearchFormProps {
  initialQuery?: string;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

function ScoreDots({ value }: { value: number }) {
  return (
    <span className="flex items-center gap-0.5">
      {Array.from({ length: 5 }, (_, i) => (
        <span
          key={i}
          className={`inline-block w-3 h-3 rounded-full ${
            i < value
              ? value >= 4
                ? 'bg-green-500'
                : value >= 3
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
              : 'bg-gray-200 dark:bg-gray-600'
          }`}
        />
      ))}
      <span className="ml-1.5 text-xs font-medium text-gray-600 dark:text-gray-400">
        {value}/5
      </span>
    </span>
  );
}

function QualityScoreCard({ score }: { score: QualityScore }) {
  const riskColors: Record<string, string> = {
    відсутній: 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    низький:   'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
    середній:  'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
    високий:   'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
  };

  const rows: { label: string; node: React.ReactNode }[] = [
    { label: 'Релевантність', node: <ScoreDots value={score.relevance} /> },
    { label: 'Пояснюваність', node: <ScoreDots value={score.explainability} /> },
    { label: "Прив’язка до бази", node: <ScoreDots value={score.db_binding} /> },
    {
      label: 'Ризик вигаданих книг',
      node: (
        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium border ${riskColors[score.hallucination_risk]}`}>
          {score.hallucination_risk}
        </span>
      ),
    },
  ];

  return (
    <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
        Оцінка відповіді
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {rows.map(({ label, node }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{label}</span>
            {node}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function SearchForm({ initialQuery = '' }: SearchFormProps) {
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('rag');
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<BookRecommendation[]>([]);
  const [activeMode, setActiveMode] = useState<SearchMode | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [qualityScore, setQualityScore] = useState<QualityScore | null>(null);
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
    setActiveMode(null);
    setNotFound(false);
    setQualityScore(null);

    try {
      const response = await fetch(`${BACKEND_URL}/api/recommendations/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, search_mode: searchMode }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData?.error || 'Помилка при отриманні рекомендацій');
      }

      const data: ApiResponse = await response.json();
      setRecommendations(data.recommendations);
      setActiveMode(data.search_mode);
      setNotFound(data.not_found ?? false);
      if (data.note) setNote(data.note);
      if (data.quality_score) setQualityScore(data.quality_score);

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
      {/* Mode selector */}
      <div className="mb-4 p-1.5 bg-gray-100 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 flex gap-1">
        {([
          {
            mode: 'keyword' as SearchMode,
            icon: <Search className="w-4 h-4" />,
            label: 'Keyword',
            desc: 'Пошук за ключовими словами',
            active: 'bg-green-500 text-white shadow',
            inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
          },
          {
            mode: 'gpt' as SearchMode,
            icon: <Brain className="w-4 h-4" />,
            label: 'GPT',
            desc: 'GPT без бази даних',
            active: 'bg-purple-500 text-white shadow',
            inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
          },
          {
            mode: 'rag' as SearchMode,
            icon: <Database className="w-4 h-4" />,
            label: 'RAG',
            desc: 'Семантичний пошук + GPT',
            active: 'bg-blue-500 text-white shadow',
            inactive: 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700',
          },
        ] as const).map(({ mode, icon, label, desc, active, inactive }) => (
          <button
            key={mode}
            type="button"
            onClick={() => setSearchMode(mode)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-medium transition-all ${
              searchMode === mode ? active : inactive
            }`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label}</span>
          </button>
        ))}
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 px-1">
        {searchMode === 'keyword' && 'Пошук лише за ключовими словами — не розуміє змісту запиту'}
        {searchMode === 'gpt'     && 'GPT відповідає зі своїх знань — може вигадувати книги'}
        {searchMode === 'rag'     && 'Семантичний пошук у власній БД + GPT для пояснень'}
      </p>

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
      {activeMode && (
        <div className={`flex items-center space-x-2 mb-4 px-4 py-2 rounded-full w-fit text-sm font-medium ${
          activeMode === 'rag'     ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200' :
          activeMode === 'gpt'    ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-800 dark:text-purple-200' :
                                    'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-200'
        }`}>
          {activeMode === 'rag'  && <><Database className="w-4 h-4" /><span>RAG — результати з бази даних</span></>}
          {activeMode === 'gpt'  && <><Brain className="w-4 h-4" /><span>GPT — без прив&apos;язки до бази</span></>}
          {activeMode === 'keyword' && <><Search className="w-4 h-4" /><span>Keyword — текстовий пошук у базі</span></>}
        </div>
      )}

      {note && !notFound && (
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
          {activeMode === 'rag' && (
            <div className="flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 w-fit text-sm text-green-800 dark:text-green-200">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              <span>Всі рекомендації сформовані на основі локальної бази даних</span>
            </div>
          )}
          {activeMode === 'keyword' && (
            <div className="flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 w-fit text-sm text-green-800 dark:text-green-200">
              <Search className="w-4 h-4 flex-shrink-0" />
              <span>Текстовий пошук у локальній базі — без AI, тільки збіг слів</span>
            </div>
          )}
          {activeMode === 'gpt' && (
            <div className="flex items-center space-x-2 mb-4 px-4 py-2 rounded-lg bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 w-fit text-sm text-amber-800 dark:text-amber-200">
              <Brain className="w-4 h-4 flex-shrink-0" />
              <span>GPT рекомендує зі своїх знань — перевіряємо наявність в локальній базі</span>
            </div>
          )}

          {qualityScore && <QualityScoreCard score={qualityScore} />}

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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h4 className="font-bold text-gray-900 dark:text-white text-xl">
                            {book.title}
                          </h4>
                          {activeMode === 'gpt' && (
                            book.in_local_db ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                                <CheckCircle className="w-3 h-3" />
                                є в локальній базі
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700">
                                <XCircle className="w-3 h-3" />
                                немає в локальній базі
                              </span>
                            )
                          )}
                        </div>
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

      {!isLoading && notFound && recommendations.length === 0 && (
        <div className="mt-6 p-6 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl">
          <div className="flex items-start gap-3 mb-4">
            <SearchX className="w-6 h-6 text-orange-500 dark:text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-orange-800 dark:text-orange-200 mb-1">
                {activeMode === 'keyword'
                  ? 'Нічого не знайдено за ключовими словами'
                  : 'У локальній базі не знайдено релевантних книг'}
              </p>
              <p className="text-orange-700 dark:text-orange-300 text-sm">{note}</p>
            </div>
          </div>
          {activeMode !== 'gpt' && (
            <div className="flex items-center gap-2 text-sm text-orange-600 dark:text-orange-400 border-t border-orange-200 dark:border-orange-700 pt-3 mt-1">
              <Brain className="w-4 h-4 flex-shrink-0" />
              <span>
                Для порівняння: GPT-режим може щось порадити навіть на цей запит — але без гарантій точності.
              </span>
            </div>
          )}
          {qualityScore && <QualityScoreCard score={qualityScore} />}
        </div>
      )}

      {!isLoading && recommendations.length === 0 && !error && !notFound && (
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
