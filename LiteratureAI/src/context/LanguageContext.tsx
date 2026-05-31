'use client';

import React, { createContext, useContext, ReactNode } from 'react';

export type Language = 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const translations: Record<string, string> = {
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
  'profile.favoriteGenres': 'Favourite Genres',
  'profile.favoriteBooks': 'Favourite Books',
  'profile.readingHistory': 'Reading History',
  'profile.preferences': 'Preferences',

  'theme.light': 'Light Theme',
  'theme.dark': 'Dark Theme',
  'stats.totalBooks': 'Total Books',
  'stats.categories': 'Categories',
  'stats.users': 'Users',
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const t = (key: string): string => translations[key] ?? key;

  const value: LanguageContextType = {
    language: 'en',
    setLanguage: () => {},
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
