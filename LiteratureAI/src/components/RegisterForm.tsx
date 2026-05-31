'use client';

import React, { useState } from 'react';
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Globe, Languages } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

interface RegisterFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const countries = [
  'Ukraine', 'USA', 'United Kingdom', 'Germany', 'France', 'Italy', 'Spain',
  'Canada', 'Australia', 'Poland', 'Czech Republic', 'Slovakia', 'Other'
];

const availableLanguages = [
  'Ukrainian', 'English', 'Deutsch', 'Français', 'Español', 'Italiano', 'Polski'
];

export default function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    nickname: '',
    country: '',
    languages: [] as string[],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }

    try {
      const success = await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        nickname: formData.nickname,
        country: formData.country,
        languages: formData.languages,
      });

      if (success) {
        onSuccess?.();
      } else {
        setError(t('msg.registerError'));
      }
    } catch {
      setError(t('msg.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languages: prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language]
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg mx-auto p-8 rounded-xl max-w-2xl">
      <div className="mb-8 text-center">
        <div className="inline-flex justify-center items-center bg-green-100 dark:bg-green-900 mb-4 rounded-full w-16 h-16">
          <UserPlus className="w-8 h-8 text-green-600 dark:text-green-400" />
        </div>
        <h2 className="font-bold text-gray-900 dark:text-white text-2xl">
          {t('title.register')}
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Create your account for personalised recommendations
        </p>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/50 mb-6 p-4 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t('form.firstName')}
            </label>
            <div className="relative">
              <User className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
                placeholder="John"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              {t('form.lastName')}
            </label>
            <div className="relative">
              <User className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
              <input
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
                placeholder="Doe"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
            {t('form.nickname')}
          </label>
          <div className="relative">
            <User className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
            <input
              type="text"
              required
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
              placeholder="bookworm2024"
            />
          </div>
        </div>

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
              className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
              placeholder="your@email.com"
            />
          </div>
        </div>

        <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
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
                className="dark:bg-gray-700 py-3 pr-12 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
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

          <div>
            <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={formData.confirmPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
                placeholder="••••••••"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
            {t('form.country')}
          </label>
          <div className="relative">
            <Globe className="top-1/2 left-3 absolute w-5 h-5 text-gray-400 -translate-y-1/2 transform" />
            <select
              required
              value={formData.country}
              onChange={(e) => setFormData(prev => ({ ...prev, country: e.target.value }))}
              className="dark:bg-gray-700 py-3 pr-4 pl-10 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-green-500 w-full dark:text-white"
            >
              <option value="">Select country</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block mb-3 font-medium text-gray-700 dark:text-gray-300 text-sm">
            <Languages className="inline mr-2 w-5 h-5" />
            {t('form.languages')}
          </label>
          <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
            {availableLanguages.map(language => (
              <label key={language} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.languages.includes(language)}
                  onChange={() => toggleLanguage(language)}
                  className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-green-500 dark:focus:ring-green-600 dark:ring-offset-gray-800 w-4 h-4 text-green-600"
                />
                <span className="text-gray-700 dark:text-gray-300 text-sm">{language}</span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="flex justify-center items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 px-4 py-3 rounded-lg w-full font-semibold text-white transition-colors duration-200"
        >
          {isLoading ? (
            <div className="border-2 border-white border-t-transparent rounded-full w-5 h-5 animate-spin" />
          ) : (
            <>
              <UserPlus className="w-5 h-5" />
              <span>{t('btn.register')}</span>
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-green-600 hover:text-green-700 dark:hover:text-green-300 dark:text-green-400"
          >
            {t('nav.login')}
          </button>
        </p>
      </div>
    </div>
  );
}
