'use client';

import React, { useState } from 'react';
import { BookOpen, User, LogOut, Sun, Moon, Globe, Menu, X, Home, BarChart2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage, Language } from '@/context/LanguageContext';

interface NavigationProps {
  currentPage: 'home' | 'profile' | 'comparison';
  onPageChange: (page: 'home' | 'profile' | 'comparison') => void;
  onAuthClick: () => void;
}

export default function Navigation({ currentPage, onPageChange, onAuthClick }: NavigationProps) {
  const { user, logout, isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { language, setLanguage, t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    onPageChange('home');
    setIsMobileMenuOpen(false);
  };

  const handleLanguageChange = (newLanguage: Language) => {
    setLanguage(newLanguage);
    setIsMobileMenuOpen(false);
  };

  const handlePageChange = (page: 'home' | 'profile' | 'comparison') => {
    onPageChange(page);
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg border-gray-200 dark:border-gray-700 border-b">
      <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => handlePageChange('home')}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <BookOpen className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              <span className="hidden sm:block font-bold text-gray-900 dark:text-white text-xl">
                BookAI
              </span>
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-6">
            <div className="flex space-x-4">
              <button
                onClick={() => handlePageChange('home')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'home'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>{t('nav.home')}</span>
              </button>

              <button
                onClick={() => handlePageChange('comparison')}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'comparison'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <BarChart2 className="w-4 h-4" />
                <span>RAG vs GPT</span>
              </button>

              {isAuthenticated && (
                <button
                  onClick={() => handlePageChange('profile')}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 'profile'
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t('nav.profile')}</span>
                </button>
              )}
            </div>

            <div className="flex items-center space-x-3">
              <div className="group relative">
                <button className="flex items-center space-x-1 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span className="text-sm">{language.toUpperCase()}</span>
                </button>
                <div className="invisible group-hover:visible top-full right-0 z-50 absolute bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100 shadow-lg mt-1 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200">
                  <button
                    onClick={() => handleLanguageChange('uk')}
                    className="block hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 first:rounded-t-lg w-full text-gray-700 dark:text-gray-300 text-sm text-left"
                  >
                    {t('language.uk')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className="block hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 last:rounded-b-lg w-full text-gray-700 dark:text-gray-300 text-sm text-left"
                  >
                    {t('language.en')}
                  </button>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
                title={theme === 'light' ? t('theme.dark') : t('theme.light')}
              >
                {theme === 'light' ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <Sun className="w-5 h-5" />
                )}
              </button>

              {isAuthenticated && user ? (
                <div className="group relative">
                  <button className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="rounded-full w-6 h-6 object-cover"
                      />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span className="font-medium text-sm">{user.nickname}</span>
                  </button>
                  <div className="invisible group-hover:visible top-full right-0 z-50 absolute bg-white dark:bg-gray-800 opacity-0 group-hover:opacity-100 shadow-lg mt-1 border border-gray-200 dark:border-gray-700 rounded-lg transition-all duration-200">
                    <button
                      onClick={() => handlePageChange('profile')}
                      className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-4 py-2 first:rounded-t-lg w-full text-gray-700 dark:text-gray-300 text-sm text-left"
                    >
                      <User className="w-4 h-4" />
                      <span>{t('nav.profile')}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-4 py-2 last:rounded-b-lg w-full text-red-600 dark:text-red-400 text-sm text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('nav.logout')}</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={onAuthClick}
                  className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium text-white text-sm transition-colors"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="hover:bg-gray-100 dark:hover:bg-gray-700 p-2 rounded-lg text-gray-700 dark:text-gray-300 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden space-y-2 py-4 border-gray-200 dark:border-gray-700 border-t">
            <button
              onClick={() => handlePageChange('home')}
              className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'home'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>{t('nav.home')}</span>
            </button>

            <button
              onClick={() => handlePageChange('comparison')}
              className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                currentPage === 'comparison'
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <BarChart2 className="w-4 h-4" />
              <span>RAG vs GPT</span>
            </button>

            {isAuthenticated && (
              <button
                onClick={() => handlePageChange('profile')}
                className={`flex items-center space-x-2 w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  currentPage === 'profile'
                    ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <User className="w-4 h-4" />
                <span>{t('nav.profile')}</span>
              </button>
            )}

            <div className="mt-2 pt-2 border-gray-200 dark:border-gray-700 border-t">
              <div className="px-3 py-2">
                <p className="font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                  {t('form.languages')}
                </p>
                <div className="space-y-1 mt-2">
                  <button
                    onClick={() => handleLanguageChange('uk')}
                    className={`block w-full text-left px-2 py-1 text-sm rounded ${
                      language === 'uk'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('language.uk')}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`block w-full text-left px-2 py-1 text-sm rounded ${
                      language === 'en'
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {t('language.en')}
                  </button>
                </div>
              </div>

              <button
                onClick={toggleTheme}
                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-700 px-3 py-2 rounded-lg w-full text-gray-700 dark:text-gray-300 text-left transition-colors"
              >
                {theme === 'light' ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                <span>{theme === 'light' ? t('theme.dark') : t('theme.light')}</span>
              </button>

              {isAuthenticated && user ? (
                <>
                  <div className="mt-2 px-3 py-2 border-gray-200 dark:border-gray-700 border-t">
                    <div className="flex items-center space-x-2">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Avatar" 
                          className="rounded-full w-8 h-8 object-cover"
                        />
                      ) : (
                        <User className="w-8 h-8 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-gray-500 dark:text-gray-400 text-xs">
                          @{user.nickname}
                        </p>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 hover:bg-red-50 dark:hover:bg-red-900/20 px-3 py-2 rounded-lg w-full text-red-600 dark:text-red-400 text-left transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>{t('nav.logout')}</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    onAuthClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-2 rounded-lg w-full font-medium text-white text-sm transition-colors"
                >
                  {t('nav.login')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
} 