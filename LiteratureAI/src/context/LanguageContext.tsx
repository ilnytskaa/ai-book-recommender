'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  uk: {
    'nav.home': 'Головна',
    'nav.search': 'Пошук',
    'nav.profile': 'Профіль',
    'nav.login': 'Увійти',
    'nav.register': 'Реєстрація',
    'nav.logout': 'Вийти',
    
    'title.main': 'Інтелектуальна система підбору літератури',
    'title.search': 'Пошук книг',
    'title.profile': 'Мій профіль',
    'title.login': 'Вхід до акаунту',
    'title.register': 'Створення акаунту',
    
    'form.email': 'Електронна пошта',
    'form.password': 'Пароль',
    'form.firstName': "Ім'я",
    'form.lastName': 'Прізвище',
    'form.nickname': 'Нікнейм',
    'form.country': 'Країна',
    'form.languages': 'Мови',
    'form.search': 'Що ви хочете почитати?',
    'form.submit': 'Відправити',
    
    'btn.search': 'Знайти книги',
    'btn.login': 'Увійти',
    'btn.register': 'Зареєструватися',
    'btn.save': 'Зберегти',
    'btn.cancel': 'Скасувати',
    'btn.edit': 'Редагувати',
    'btn.delete': 'Видалити',
    'btn.startSearching': 'Почати пошук',
    
    'msg.loading': 'Завантаження...',
    'msg.searching': 'Шукаємо ідеальні книги для вас...',
    'msg.noResults': 'Нічого не знайдено',
    'msg.error': 'Виникла помилка',
    'msg.success': 'Успішно збережено',
    'msg.loginSuccess': 'Успішний вхід',
    'msg.loginError': 'Невірний email або пароль',
    'msg.registerSuccess': 'Акаунт створено успішно',
    'msg.registerError': 'Користувач з таким email вже існує',
    
    'profile.personalInfo': 'Особиста інформація',
    'profile.avatar': 'Аватар',
    'profile.favoriteGenres': 'Улюблені жанри',
    'profile.favoriteBooks': 'Улюблені книги',
    'profile.readingHistory': 'Історія читання',
    'profile.preferences': 'Налаштування',
    
    'theme.light': 'Світла тема',
    'theme.dark': 'Темна тема',
    'language.uk': 'Українська',
    'language.en': 'English',
    'stats.totalBooks': 'Всього книг',
    'stats.categories': 'Категорій',
    'stats.users': 'Користувачів',
  },
  en: {
    'nav.home': 'Home',
    'nav.search': 'Search',
    'nav.profile': 'Profile',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.logout': 'Logout',
    
    'title.main': 'Intelligent Literature Recommendation System',
    'title.search': 'Book Search',
    'title.profile': 'My Profile',
    'title.login': 'Login to Account',
    'title.register': 'Create Account',
    
    'form.email': 'Email',
    'form.password': 'Password',
    'form.firstName': 'First Name',
    'form.lastName': 'Last Name',
    'form.nickname': 'Nickname',
    'form.country': 'Country',
    'form.languages': 'Languages',
    'form.search': 'What would you like to read?',
    'form.submit': 'Submit',
    
    'btn.search': 'Find Books',
    'btn.login': 'Login',
    'btn.register': 'Register',
    'btn.save': 'Save',
    'btn.cancel': 'Cancel',
    'btn.edit': 'Edit',
    'btn.delete': 'Delete',
    'btn.startSearching': 'Start Searching',
    
    'msg.loading': 'Loading...',
    'msg.searching': 'Finding perfect books for you...',
    'msg.noResults': 'No results found',
    'msg.error': 'An error occurred',
    'msg.success': 'Successfully saved',
    'msg.loginSuccess': 'Login successful',
    'msg.loginError': 'Invalid email or password',
    'msg.registerSuccess': 'Account created successfully',
    'msg.registerError': 'User with this email already exists',
    
    'profile.personalInfo': 'Personal Information',
    'profile.avatar': 'Avatar',
    'profile.favoriteGenres': 'Favorite Genres',
    'profile.favoriteBooks': 'Favorite Books',
    'profile.readingHistory': 'Reading History',
    'profile.preferences': 'Preferences',
    
    'theme.light': 'Light Theme',
    'theme.dark': 'Dark Theme',
    'language.uk': 'Українська',
    'language.en': 'English',
    'stats.totalBooks': 'Total Books',
    'stats.categories': 'Categories',
    'stats.users': 'Users',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('uk');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['uk', 'en'].includes(savedLanguage)) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 