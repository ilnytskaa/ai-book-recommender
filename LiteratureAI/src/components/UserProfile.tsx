'use client';

import React, { useState, useRef } from 'react';
import { User, Edit3, Save, X, Upload, Trash2, Star, Heart } from 'lucide-react';
import { useAuth, User as UserType } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';

const countries = [
  'Україна', 'США', 'Великобританія', 'Німеччина', 'Франція', 'Італія', 'Іспанія',
  'Канада', 'Австралія', 'Польща', 'Чехія', 'Словаччина', 'Інше'
];

const availableLanguages = [
  'Українська', 'English', 'Deutsch', 'Français', 'Español', 'Italiano', 'Polski'
];

const genres = [
  'Романтика', 'Фентезі', 'Наукова фантастика', 'Детектив', 'Трилер', 'Історичний роман',
  'Сучасна література', 'Класика', 'Біографія', 'Філософія', 'Поезія', 'Драма',
  'Пригоди', 'Містика', 'Хорор', 'Гумор', 'Мемуари', 'Саморозвиток'
];

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<Partial<UserType>>(user || {});
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!user) return null;

  const handleSave = () => {
    updateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(user);
    setIsEditing(false);
  };

  const handleAvatarUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const avatarUrl = e.target?.result as string;
        setEditData((prev: Partial<UserType>) => ({ ...prev, avatar: avatarUrl }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setEditData((prev: Partial<UserType>) => ({ ...prev, avatar: undefined }));
  };

  const toggleGenre = (genre: string) => {
    setEditData((prev: Partial<UserType>) => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres?.includes(genre)
        ? prev.favoriteGenres.filter((g: string) => g !== genre)
        : [...(prev.favoriteGenres || []), genre]
    }));
  };

  const toggleLanguage = (language: string) => {
    setEditData((prev: Partial<UserType>) => ({
      ...prev,
      languages: prev.languages?.includes(language)
        ? prev.languages.filter((l: string) => l !== language)
        : [...(prev.languages || []), language]
    }));
  };

  const removeFavoriteBook = (bookId: string) => {
    setEditData((prev: Partial<UserType>) => ({
      ...prev,
      favoriteBooks: prev.favoriteBooks?.filter((book) => book.id !== bookId) || []
    }));
  };

  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg mx-auto rounded-xl max-w-4xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8 text-white">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="relative">
              <div className="flex justify-center items-center bg-white/20 backdrop-blur-sm border-4 border-white/30 rounded-full w-24 h-24 overflow-hidden">
                {editData.avatar ? (
                  <img 
                    src={editData.avatar} 
                    alt="Avatar" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-white/80" />
                )}
              </div>
              {isEditing && (
                <div className="-right-2 -bottom-2 absolute flex space-x-1">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg p-2 rounded-full text-white transition-colors"
                    title="Завантажити фото"
                  >
                    <Upload className="w-4 h-4" />
                  </button>
                  {editData.avatar && (
                    <button
                      onClick={removeAvatar}
                      className="bg-red-600 hover:bg-red-700 shadow-lg p-2 rounded-full text-white transition-colors"
                      title="Видалити фото"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </div>
              )}
            </div>
            <div>
              <h1 className="font-bold text-3xl">
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editData.firstName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, firstName: e.target.value }))}
                      className="bg-white/20 mr-2 px-3 py-1 border border-white/30 rounded-lg text-white placeholder-white/60"
                      placeholder="Ім'я"
                    />
                    <input
                      type="text"
                      value={editData.lastName || ''}
                      onChange={(e) => setEditData(prev => ({ ...prev, lastName: e.target.value }))}
                      className="bg-white/20 px-3 py-1 border border-white/30 rounded-lg text-white placeholder-white/60"
                      placeholder="Прізвище"
                    />
                  </div>
                ) : (
                  `${user.firstName} ${user.lastName}`
                )}
              </h1>
              <p className="text-white/80 text-xl">
                @{isEditing ? (
                  <input
                    type="text"
                    value={editData.nickname || ''}
                    onChange={(e) => setEditData(prev => ({ ...prev, nickname: e.target.value }))}
                    className="inline-block bg-white/20 px-3 py-1 border border-white/30 rounded-lg w-48 text-white placeholder-white/60"
                    placeholder="Нікнейм"
                  />
                ) : (
                  user.nickname
                )}
              </p>
              <p className="text-white/70">
                Користувач з {new Date(user.createdAt).toLocaleDateString('uk-UA')}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white transition-colors"
                >
                  <Save className="w-5 h-5" />
                  <span>{t('btn.save')}</span>
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 px-4 py-2 rounded-lg text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                  <span>{t('btn.cancel')}</span>
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center space-x-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm px-4 py-2 rounded-lg text-white transition-colors"
              >
                <Edit3 className="w-5 h-5" />
                <span>{t('btn.edit')}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-8 p-8">
        <section>
          <h2 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
            {t('profile.personalInfo')}
          </h2>
          <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                {t('form.email')}
              </label>
              <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white">
                {user.email}
              </p>
            </div>
            <div>
              <label className="block mb-2 font-medium text-gray-700 dark:text-gray-300 text-sm">
                {t('form.country')}
              </label>
              {isEditing ? (
                <select
                  value={editData.country || ''}
                  onChange={(e) => setEditData(prev => ({ ...prev, country: e.target.value }))}
                  className="dark:bg-gray-700 p-3 border border-gray-300 dark:border-gray-600 focus:border-transparent rounded-lg focus:ring-2 focus:ring-blue-500 w-full dark:text-white"
                >
                  <option value="">Оберіть країну</option>
                  {countries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              ) : (
                <p className="bg-gray-50 dark:bg-gray-700 p-3 rounded-lg text-gray-900 dark:text-white">
                  {user.country || 'Не вказано'}
                </p>
              )}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
            {t('form.languages')}
          </h2>
          {isEditing ? (
            <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
              {availableLanguages.map(language => (
                <label key={language} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.languages?.includes(language) || false}
                    onChange={() => toggleLanguage(language)}
                    className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 w-4 h-4 text-blue-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{language}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.languages?.map(language => (
                <span
                  key={language}
                  className="bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full text-blue-800 dark:text-blue-200 text-sm"
                >
                  {language}
                </span>
              )) || <span className="text-gray-500 dark:text-gray-400">Не вказано</span>}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
            {t('profile.favoriteGenres')}
          </h2>
          {isEditing ? (
            <div className="gap-3 grid grid-cols-2 md:grid-cols-3">
              {genres.map(genre => (
                <label key={genre} className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editData.favoriteGenres?.includes(genre) || false}
                    onChange={() => toggleGenre(genre)}
                    className="bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 w-4 h-4 text-purple-600"
                  />
                  <span className="text-gray-700 dark:text-gray-300 text-sm">{genre}</span>
                </label>
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {user.favoriteGenres?.map(genre => (
                <span
                  key={genre}
                  className="bg-purple-100 dark:bg-purple-900 px-3 py-1 rounded-full text-purple-800 dark:text-purple-200 text-sm"
                >
                  {genre}
                </span>
              )) || <span className="text-gray-500 dark:text-gray-400">Не вказано</span>}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-6 font-bold text-gray-900 dark:text-white text-2xl">
            {t('profile.favoriteBooks')}
          </h2>
          {user.favoriteBooks && user.favoriteBooks.length > 0 ? (
            <div className="gap-6 grid grid-cols-1 md:grid-cols-2">
              {(isEditing ? editData.favoriteBooks : user.favoriteBooks)?.map(book => (
                <div key={book.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">
                        {book.title}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-400">{book.author}</p>
                      {book.rating && (
                        <div className="flex items-center space-x-1 mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${
                                star <= book.rating!
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300 dark:text-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      )}
                      <p className="mt-2 text-gray-500 dark:text-gray-400 text-xs">
                        Додано: {new Date(book.dateAdded).toLocaleDateString('uk-UA')}
                      </p>
                    </div>
                    {isEditing && (
                      <button
                        onClick={() => removeFavoriteBook(book.id)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Видалити з улюблених"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Heart className="mx-auto mb-4 w-16 h-16 text-gray-300 dark:text-gray-600" />
              <p className="text-gray-500 dark:text-gray-400">
                У вас поки немає улюблених книг
              </p>
              <p className="mt-2 text-gray-400 dark:text-gray-500 text-sm">
                Додавайте книги в улюблені під час пошуку рекомендацій
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
} 