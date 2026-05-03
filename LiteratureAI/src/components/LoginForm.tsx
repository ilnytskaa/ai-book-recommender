'use client';

import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface LoginFormProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      if (success) {
        onSuccess?.();
      } else {
        setError(t('msg.loginError'));
      }
    } catch {
      setError(t('msg.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg mx-auto p-8 rounded-xl max-w-md">
      <div className="mb-8 text-center">
        <div className="inline-flex justify-center items-center bg-blue-100 dark:bg-blue-900 mb-4 rounded-full w-16 h-16">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
          {t('title.login')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ласкаво просимо назад!
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
            {t('form.email')}
          </label>
          <div className="relative">
            <Mail className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:text-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
            {t('form.password')}
          </label>
          <div className="relative">
            <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={formData.password}
              onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
              className="dark:bg-gray-700 py-3 pr-12 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:text-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="top-1/2 right-3 absolute text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 -translate-y-1/2 transform"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 px-4 py-3 rounded-lg w-full font-semibold text-white transition-colors duration-200"
        >
          {isLoading ? (
            <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
          ) : (
            <>
              <LogIn className="w-5 h-5" />
              <span>{t('btn.login')}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Немає акаунту?{' '}
          <button
            onClick={onSwitchToRegister}
            className="font-medium text-blue-600 hover:text-blue-700 dark:hover:text-blue-300 dark:text-blue-400"
          >
            {t('nav.register')}
          </button>
        </p>
      </div>
    </div>
  );
} 