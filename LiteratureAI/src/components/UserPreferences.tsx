'use client';

import { useState, useEffect } from 'react';
import { Settings, Heart, BookOpen, Filter, Save } from 'lucide-react';

interface UserPreferences {
  favoriteGenres: string[];
  favoriteAuthors: string[];
  readingGoal: number;
  preferredLanguages: string[];
  ageRating: string;
  bookLength: string;
  mood: string[];
}

const defaultPreferences: UserPreferences = {
  favoriteGenres: [],
  favoriteAuthors: [],
  readingGoal: 12,
  preferredLanguages: ['Ukrainian', 'English'],
  ageRating: 'all',
  bookLength: 'any',
  mood: []
};

const genres = [
  'Fantasy', 'Romance', 'Mystery', 'Science Fiction', 'Thriller',
  'Historical Fiction', 'Biography', 'Philosophy', 'Self-Development', 'Ukrainian Literature',
  'Classic Literature', 'Contemporary Fiction', 'Poetry', 'Drama', 'Comedy'
];

const moods = [
  'Cheerful', 'Romantic', 'Adventurous', 'Philosophical', 'Tense',
  'Calm', 'Motivating', 'Melancholic', 'Mysterious', 'Inspiring'
];

export default function UserPreferences() {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('userPreferences');
    if (saved) {
      setPreferences(JSON.parse(saved));
    }
  }, []);

  const savePreferences = () => {
    localStorage.setItem('userPreferences', JSON.stringify(preferences));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const toggleGenre = (genre: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const toggleMood = (mood: string) => {
    setPreferences(prev => ({
      ...prev,
      mood: prev.mood.includes(mood)
        ? prev.mood.filter(m => m !== mood)
        : [...prev.mood, mood]
    }));
  };

  return (
    <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-lg">Personalisation</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? 'Collapse' : 'Customise'}
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {preferences.favoriteGenres.slice(0, 3).map(genre => (
          <span key={genre} className="bg-blue-100 px-2 py-1 rounded-full text-blue-800 text-sm">
            {genre}
          </span>
        ))}
        {preferences.favoriteGenres.length > 3 && (
          <span className="text-gray-500 text-sm">+{preferences.favoriteGenres.length - 3} more</span>
        )}
      </div>

      {isExpanded && (
        <div className="space-y-6">
          <div>
            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-900">
              <Heart className="w-4 h-4 text-red-500" />
              <span>Favourite genres</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {genres.map(genre => (
                <button
                  key={genre}
                  onClick={() => toggleGenre(genre)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferences.favoriteGenres.includes(genre)
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-900">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span>Reading goal (books per year)</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={preferences.readingGoal}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                readingGoal: parseInt(e.target.value)
              }))}
              className="w-full"
            />
            <div className="flex justify-between text-gray-600 text-sm">
              <span>1</span>
              <span className="font-medium">{preferences.readingGoal} books</span>
              <span>100</span>
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2 mb-3 font-medium text-gray-900">
              <Filter className="w-4 h-4 text-purple-500" />
              <span>Favourite moods</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {moods.map(mood => (
                <button
                  key={mood}
                  onClick={() => toggleMood(mood)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors ${
                    preferences.mood.includes(mood)
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {mood}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-3 font-medium text-gray-900">Preferred book length</label>
            <select
              value={preferences.bookLength}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                bookLength: e.target.value
              }))}
              className="p-2 border border-gray-300 rounded-lg w-full"
            >
              <option value="any">Any</option>
              <option value="short">Short (up to 200 pages)</option>
              <option value="medium">Medium (200–400 pages)</option>
              <option value="long">Long (400+ pages)</option>
            </select>
          </div>

          <div>
            <label className="block mb-3 font-medium text-gray-900">Age rating</label>
            <select
              value={preferences.ageRating}
              onChange={(e) => setPreferences(prev => ({
                ...prev,
                ageRating: e.target.value
              }))}
              className="p-2 border border-gray-300 rounded-lg w-full"
            >
              <option value="all">No restrictions</option>
              <option value="teen">Teens (13+)</option>
              <option value="adult">Adults (18+)</option>
            </select>
          </div>

          <button
            onClick={savePreferences}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all ${
              isSaved
                ? 'bg-green-600 text-white'
                : 'bg-blue-600 hover:bg-blue-700 text-white'
            }`}
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Saved!' : 'Save settings'}</span>
          </button>
        </div>
      )}
    </div>
  );
}
