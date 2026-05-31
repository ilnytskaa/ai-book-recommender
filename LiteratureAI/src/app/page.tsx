'use client';

import { useState } from 'react';
import { BookOpen, ArrowDown, Users, BookMarked, Target } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import Navigation from '@/components/Navigation';
import SearchForm from '@/components/SearchForm';
import LoginForm from '@/components/LoginForm';
import RegisterForm from '@/components/RegisterForm';
import UserProfile from '@/components/UserProfile';
import Stats from '@/components/Stats';
import ComparisonChart from '@/components/ComparisonChart';
import ThemeDebug from '@/components/ThemeDebug';

type AuthMode = 'login' | 'register' | null;
type Page = 'home' | 'profile' | 'comparison';

function AppContent() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [authMode, setAuthMode] = useState<AuthMode>(null);
  const { t } = useLanguage();

  const scrollToSearch = () => {
    document.getElementById('search-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  const handleAuthSuccess = () => {
    setAuthMode(null);
    setCurrentPage('home');
  };

  const renderAuthModal = () => {
    if (!authMode) return null;

  return (
      <div className="z-50 fixed inset-0 flex justify-center items-center bg-black bg-opacity-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-4 border-gray-200 dark:border-gray-700 border-b">
            <h2 className="font-bold text-gray-900 dark:text-white text-xl">
              {authMode === 'login' ? t('title.login') : t('title.register')}
            </h2>
            <button
              onClick={() => setAuthMode(null)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 dark:text-gray-400"
            >
              ✕
            </button>
          </div>
          <div className="p-6">
            {authMode === 'login' ? (
              <LoginForm
                onSuccess={handleAuthSuccess}
                onSwitchToRegister={() => setAuthMode('register')}
              />
            ) : (
              <RegisterForm
                onSuccess={handleAuthSuccess}
                onSwitchToLogin={() => setAuthMode('login')}
              />
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderHomePage = () => (
    <>
      <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 py-20 text-white">
        <div className="mx-auto px-4 text-center container">
          <div className="mx-auto max-w-4xl">
            <div className="inline-flex justify-center items-center bg-white/20 backdrop-blur-sm mb-8 rounded-full w-20 h-20">
              <BookOpen className="w-10 h-10" />
            </div>
            <h1 className="mb-6 font-bold text-5xl md:text-6xl leading-tight">
              {t('title.main')}
            </h1>
            <p className="mx-auto mb-8 max-w-3xl text-white/90 text-xl md:text-2xl">
              Знайдіть ідеальні книги за допомогою штучного інтелекту. 
              Просто опишіть свій настрій або те, що шукаєте!
            </p>
            <button
              onClick={scrollToSearch}
              className="inline-flex items-center space-x-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-8 py-4 rounded-xl font-semibold text-white hover:scale-105 transition-all duration-300 transform"
            >
              <span className="text-lg">{t('btn.startSearching')}</span>
              <ArrowDown className="w-6 h-6 animate-bounce" />
            </button>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 dark:bg-gray-900 py-16">
        <div className="mx-auto px-4 container">
          <Stats />
        </div>
      </section>

      <section id="search-section" className="bg-white dark:bg-gray-800 py-20">
        <div className="mx-auto px-4 container">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-4xl">
                {t('title.search')}
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-xl">
                Опишіть, що ви хочете почитати, і ми знайдемо ідеальні варіанти
              </p>
            </div>
            <SearchForm />
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-br from-purple-50 dark:from-purple-900/20 to-blue-50 dark:to-blue-900/20 py-20">
        <div className="mx-auto px-4 container">
          <div className="mb-16 text-center">
            <h2 className="mb-4 font-bold text-gray-900 dark:text-white text-4xl">
              Чому обирають BookAI?
            </h2>
            <p className="mx-auto max-w-2xl text-gray-600 dark:text-gray-400 text-xl">
              Наша система використовує найсучасніші технології для персоналізованих рекомендацій
            </p>
          </div>

          <div className="gap-8 grid md:grid-cols-3 mx-auto max-w-6xl">
            <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl text-center">
              <div className="inline-flex justify-center items-center bg-blue-100 dark:bg-blue-900 mb-6 rounded-full w-16 h-16">
                <Target className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white text-2xl">
                Персоналізовані рекомендації
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                ШІ аналізує ваші вподобання та знаходить книги, які точно вам сподобаються
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl text-center">
              <div className="inline-flex justify-center items-center bg-purple-100 dark:bg-purple-900 mb-6 rounded-full w-16 h-16">
                <BookMarked className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white text-2xl">
                Величезна база книг
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Тисячі книг різних жанрів від класики до сучасних бестселерів
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 shadow-lg p-8 rounded-2xl text-center">
              <div className="inline-flex justify-center items-center bg-green-100 dark:bg-green-900 mb-6 rounded-full w-16 h-16">
                <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="mb-4 font-bold text-gray-900 dark:text-white text-2xl">
                Спільнота читачів
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Діліться відгуками та відкривайте нових авторів разом з іншими
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );

  const renderProfilePage = () => (
    <section className="bg-gray-50 dark:bg-gray-900 py-8 min-h-screen">
      <div className="mx-auto px-4 container">
        <UserProfile />
      </div>
    </section>
  );

  const renderComparisonPage = () => (
    <section className="bg-gray-50 dark:bg-gray-900 py-12 min-h-screen">
      <div className="mx-auto px-4 max-w-3xl container">
        <div className="mb-8 text-center">
          <h1 className="font-bold text-gray-900 dark:text-white text-3xl mb-2">
            Порівняння RAG vs GPT
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Агрегована статистика якості відповідей на основі реальних запитів
          </p>
        </div>
        <ComparisonChart />
      </div>
    </section>
  );

  return (
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Navigation
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onAuthClick={() => setAuthMode('login')}
      />
      
      <main>
        {currentPage === 'home' && renderHomePage()}
        {currentPage === 'profile' && renderProfilePage()}
        {currentPage === 'comparison' && renderComparisonPage()}
      </main>

      {renderAuthModal()}
      
      {process.env.NODE_ENV === 'development' && <ThemeDebug />}
    </div>
  );
}

export default function Home() {
  return <AppContent />;
}
