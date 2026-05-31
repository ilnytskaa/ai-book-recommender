'use client';

import { useState, useEffect } from 'react';
import { Clock, X, RotateCcw, Trash2, Search } from 'lucide-react';

interface SearchHistoryItem {
  id: string;
  query: string;
  timestamp: string;
  resultsCount: number;
}

interface SearchHistoryProps {
  onSelectQuery: (query: string) => void;
}

export const addToSearchHistory = (query: string, resultsCount: number) => {
  const newItem = {
    id: Date.now().toString(),
    query,
    timestamp: new Date().toISOString(),
    resultsCount
  };

  const savedHistory = localStorage.getItem('searchHistory');
  const currentHistory = savedHistory ? JSON.parse(savedHistory) : [];
  const updatedHistory = [newItem, ...currentHistory.filter((item: SearchHistoryItem) => item.query !== query)].slice(0, 10);
  localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
};

export default function SearchHistory({ onSelectQuery }: SearchHistoryProps) {
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const savedHistory = localStorage.getItem('searchHistory');
    if (savedHistory) {
      setSearchHistory(JSON.parse(savedHistory));
    }
  }, []);

  const removeFromHistory = (id: string) => {
    const updatedHistory = searchHistory.filter(item => item.id !== id);
    setSearchHistory(updatedHistory);
    localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  if (searchHistory.length === 0) {
    return null;
  }

  return (
    <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-gray-900 text-lg">Search History</h3>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isExpanded ? 'Collapse' : 'Expand'}
          </button>
          {searchHistory.length > 0 && (
            <button
              onClick={clearHistory}
              className="flex items-center space-x-1 text-red-600 hover:text-red-800 transition-colors"
              title="Clear history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className={`space-y-2 ${isExpanded ? '' : 'max-h-48 overflow-hidden'}`}>
        {searchHistory.map((item) => (
          <div
            key={item.id}
            className="group flex justify-between items-center bg-gray-50 hover:bg-blue-50 p-3 rounded-lg transition-colors"
          >
            <button
              onClick={() => onSelectQuery(item.query)}
              className="flex flex-1 items-center space-x-3 text-left"
            >
              <Search className="w-4 h-4 text-gray-400" />
              <div className="flex-1">
                <p className="font-medium text-gray-900 truncate">{item.query}</p>
                <div className="flex items-center space-x-4 text-gray-500 text-sm">
                  <span>{formatTime(item.timestamp)}</span>
                  <span>•</span>
                  <span>{item.resultsCount} results</span>
                </div>
              </div>
            </button>

            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onSelectQuery(item.query)}
                className="p-1 text-blue-600 hover:text-blue-800 transition-colors"
                title="Repeat search"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => removeFromHistory(item.id)}
                className="p-1 text-red-600 hover:text-red-800 transition-colors"
                title="Remove from history"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isExpanded && searchHistory.length > 3 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-3 w-full text-blue-600 hover:text-blue-800 text-sm text-center transition-colors"
        >
          Show all ({searchHistory.length})
        </button>
      )}
    </div>
  );
}
