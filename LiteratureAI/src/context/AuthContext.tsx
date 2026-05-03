'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  nickname: string;
  avatar?: string;
  country: string;
  languages: string[];
  favoriteGenres: string[];
  favoriteBooks: {
    id: string;
    title: string;
    author: string;
    dateAdded: string;
    rating?: number;
  }[];
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: RegisterData) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<User>) => void;
  isAuthenticated: boolean;
  loading: boolean;
  addFavoriteBook: (book: { id: string; title: string; author: string; rating?: number }) => void;
  removeFavoriteBook: (bookId: string) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  nickname: string;
  country: string;
  languages: string[];
}

interface StoredUser extends User {
  password: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users: StoredUser[] = JSON.parse(savedUsers);
      const foundUser = users.find(u => u.email === email && u.password === password);
      if (foundUser) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { password: __password, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        return true;
      }
    }
    return false;
  };

  const register = async (userData: RegisterData): Promise<boolean> => {
    const savedUsers = localStorage.getItem('users');
    const users: StoredUser[] = savedUsers ? JSON.parse(savedUsers) : [];
    
    if (users.some(u => u.email === userData.email)) {
      return false;
    }

    const newUser: StoredUser = {
      id: Date.now().toString(),
      ...userData,
      avatar: undefined,
      favoriteGenres: [],
      favoriteBooks: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: __password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(userWithoutPassword));
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const updateProfile = (updates: Partial<User>) => {
    if (!user) return;

    const updatedUser = { ...user, ...updates };
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));

    const savedUsers = localStorage.getItem('users');
    if (savedUsers) {
      const users: StoredUser[] = JSON.parse(savedUsers);
      const updatedUsers = users.map(u => 
        u.id === user.id ? { ...u, ...updates } : u
      );
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
  };

  const addFavoriteBook = (book: { id: string; title: string; author: string; rating?: number }) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      favoriteBooks: [...(user.favoriteBooks || []), { ...book, dateAdded: new Date().toISOString() }]
    };
    updateProfile(updatedUser);
  };

  const removeFavoriteBook = (bookId: string) => {
    if (!user) return;

    const updatedUser = {
      ...user,
      favoriteBooks: user.favoriteBooks.filter(book => book.id !== bookId)
    };
    updateProfile(updatedUser);
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    updateProfile,
    isAuthenticated,
    loading,
    addFavoriteBook,
    removeFavoriteBook
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 