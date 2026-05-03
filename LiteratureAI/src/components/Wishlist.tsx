'use client';

import { useState, useEffect } from 'react';
import { Heart, X, User, Calendar } from 'lucide-react';

interface WishlistBook {
  id: string;
  title: string;
  author: string;
  genre: string;
  year?: number;
  addedDate: string;
  priority: 'high' | 'medium' | 'low';
}

export default function Wishlist() {
  const [wishlist, setWishlist] = useState<WishlistBook[]>([]);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('bookWishlist');
    if (saved) {
      setWishlist(JSON.parse(saved));
    }
  }, []);

  const removeFromWishlist = (id: string) => {
    const updated = wishlist.filter(book => book.id !== id);
    setWishlist(updated);
    localStorage.setItem('bookWishlist', JSON.stringify(updated));
  };

  const changePriority = (id: string, priority: 'high' | 'medium' | 'low') => {
    const updated = wishlist.map(book => 
      book.id === id ? { ...book, priority } : book
    );
    setWishlist(updated);
    localStorage.setItem('bookWishlist', JSON.stringify(updated));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (wishlist.length === 0) {
    return (
      <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
        <div className="flex items-center space-x-2 mb-4">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900 text-lg">Список бажань</h3>
        </div>
        <p className="text-gray-600">Ваш список бажань порожній. Додавайте книги, які хочете прочитати!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Heart className="w-5 h-5 text-red-500" />
          <h3 className="font-bold text-gray-900 text-lg">Список бажань ({wishlist.length})</h3>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {isExpanded ? 'Згорнути' : 'Розгорнути'}
        </button>
      </div>

      <div className={`space-y-3 ${isExpanded ? '' : 'max-h-64 overflow-hidden'}`}>
        {wishlist.map((book) => (
          <div key={book.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h4 className="mb-1 font-bold text-gray-900">{book.title}</h4>
                <div className="flex items-center space-x-4 mb-2 text-gray-600 text-sm">
                  <div className="flex items-center space-x-1">
                    <User className="w-3 h-3" />
                    <span>{book.author}</span>
                  </div>
                  {book.year && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{book.year}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 px-2 py-1 rounded text-blue-800 text-xs">
                    {book.genre}
                  </span>
                  <select
                    value={book.priority}
                    onChange={(e) => changePriority(book.id, e.target.value as 'high' | 'medium' | 'low')}
                    className={`px-2 py-1 rounded text-xs ${getPriorityColor(book.priority)}`}
                  >
                    <option value="high">Високий</option>
                    <option value="medium">Середній</option>
                    <option value="low">Низький</option>
                  </select>
                </div>
              </div>
              <button
                onClick={() => removeFromWishlist(book.id)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
                title="Видалити зі списку бажань"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isExpanded && wishlist.length > 3 && (
        <button
          onClick={() => setIsExpanded(true)}
          className="mt-3 w-full text-blue-600 hover:text-blue-800 text-sm text-center transition-colors"
        >
          Показати всі книги ({wishlist.length})
        </button>
      )}
    </div>
  );
}

export const addToWishlist = (title: string, author: string, genre: string, year?: number) => {
  const newBook: WishlistBook = {
    id: Date.now().toString(),
    title,
    author,
    genre,
    year,
    addedDate: new Date().toISOString(),
    priority: 'medium'
  };

  const saved = localStorage.getItem('bookWishlist');
  const currentWishlist = saved ? JSON.parse(saved) : [];
  
  const exists = currentWishlist.some((book: WishlistBook) => 
    book.title === title && book.author === author
  );

  if (!exists) {
    const updatedWishlist = [newBook, ...currentWishlist];
    localStorage.setItem('bookWishlist', JSON.stringify(updatedWishlist));
    return true;
  }
  return false;
}; 