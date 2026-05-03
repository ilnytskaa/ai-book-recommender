'use client';

import { useState } from 'react';
import { Star, ThumbsUp, User } from 'lucide-react';

interface Review {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

interface BookRatingProps {
  bookTitle: string;
  currentRating?: number;
  totalReviews?: number;
}

export default function BookRating({ 
  bookTitle, 
  currentRating = 0, 
  totalReviews = 0 
}: BookRatingProps) {
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviews, setReviews] = useState<Review[]>([
    {
      id: '1',
      userId: 'user1',
      userName: 'Марія К.',
      rating: 5,
      comment: 'Чудова книга! Не могла відірватися від читання. Рекомендую всім!',
      date: '2024-05-20',
      helpful: 12
    },
    {
      id: '2',
      userId: 'user2',
      userName: 'Олексій П.',
      rating: 4,
      comment: 'Дуже цікавий сюжет, але кінцівка трохи розчарувала.',
      date: '2024-05-18',
      helpful: 8
    }
  ]);

  const handleRatingSubmit = () => {
    if (userRating === 0 || !review.trim()) return;

    const newReview: Review = {
      id: Date.now().toString(),
      userId: 'current-user',
      userName: 'Ви',
      rating: userRating,
      comment: review,
      date: new Date().toISOString().split('T')[0],
      helpful: 0
    };

    setReviews([newReview, ...reviews]);
    setUserRating(0);
    setReview('');
    setShowReviewForm(false);
  };

  const handleHelpful = (reviewId: string) => {
    setReviews(reviews.map(r => 
      r.id === reviewId ? { ...r, helpful: r.helpful + 1 } : r
    ));
  };

  return (
    <div className="bg-white shadow-lg p-6 border border-gray-100 rounded-2xl">
      <h3 className="mb-4 font-bold text-gray-900 text-xl">
        Рейтинги та відгуки: {bookTitle}
      </h3>
      
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-6 h-6 ${
                star <= currentRating ? 'text-yellow-500 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="font-semibold text-gray-900 text-lg">
          {currentRating.toFixed(1)} з 5
        </span>
        <span className="text-gray-600">
          ({totalReviews} відгуків)
        </span>
      </div>

      {!showReviewForm && (
        <button
          onClick={() => setShowReviewForm(true)}
          className="bg-blue-600 hover:bg-blue-700 mb-6 px-4 py-2 rounded-lg font-medium text-white transition-colors"
        >
          Написати відгук
        </button>
      )}

      {showReviewForm && (
        <div className="bg-gray-50 mb-6 p-4 border border-gray-200 rounded-lg">
          <h4 className="mb-3 font-semibold text-gray-900">Ваш відгук</h4>
          
          <div className="flex items-center space-x-1 mb-3">
            <span className="mr-2 text-gray-700">Ваш рейтинг:</span>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  star <= (hoverRating || userRating) 
                    ? 'text-yellow-500 fill-current' 
                    : 'text-gray-300 hover:text-yellow-400'
                }`}
                onClick={() => setUserRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              />
            ))}
          </div>

          <textarea
            value={review}
            onChange={(e) => setReview(e.target.value)}
            placeholder="Поділіться своїми враженнями про книгу..."
            className="mb-3 p-3 border border-gray-300 rounded-lg w-full h-24 resize-none"
          />

          <div className="flex space-x-2">
            <button
              onClick={handleRatingSubmit}
              disabled={userRating === 0 || !review.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-2 rounded-lg font-medium text-white transition-colors disabled:cursor-not-allowed"
            >
              Опублікувати
            </button>
            <button
              onClick={() => {
                setShowReviewForm(false);
                setUserRating(0);
                setReview('');
              }}
              className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-medium text-gray-700 transition-colors"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h4 className="font-semibold text-gray-900">Відгуки читачів</h4>
        {reviews.map((review) => (
          <div key={review.id} className="bg-gray-50 p-4 border border-gray-200 rounded-lg">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-900">{review.userName}</span>
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${
                        star <= review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-gray-500 text-sm">{review.date}</span>
            </div>
            <p className="mb-3 text-gray-700">{review.comment}</p>
            <button
              onClick={() => handleHelpful(review.id)}
              className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-sm">Корисно ({review.helpful})</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
} 