'use client';

import React from 'react';
import { BookOpen, Search, Sparkles, Heart, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface SearchAnimationProps {
  message?: string;
}

export default function SearchAnimation({ message }: SearchAnimationProps) {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col justify-center items-center space-y-8 py-16">
      <div className="relative">
        <div className="z-10 relative">
          <BookOpen className="w-20 h-20 text-blue-600 dark:text-blue-400 animate-pulse" />
        </div>
        
        <div className="absolute inset-0 animate-spin">
          <div className="-top-4 -left-4 absolute">
            <Search className="w-6 h-6 text-purple-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
          <div className="-top-4 -right-4 absolute">
            <Sparkles className="w-6 h-6 text-yellow-500 animate-bounce" style={{ animationDelay: '0.4s' }} />
          </div>
          <div className="-bottom-4 -left-4 absolute">
            <Heart className="w-6 h-6 text-red-500 animate-bounce" style={{ animationDelay: '0.6s' }} />
          </div>
          <div className="-right-4 -bottom-4 absolute">
            <Star className="w-6 h-6 text-green-500 animate-bounce" style={{ animationDelay: '0.8s' }} />
          </div>
        </div>

        <div className="absolute inset-0 -m-8">
          <div className="opacity-20 border-4 border-blue-200 dark:border-blue-800 rounded-full w-36 h-36 animate-ping"></div>
        </div>
        <div className="absolute inset-0 -m-12">
          <div className="opacity-15 border-2 border-purple-200 dark:border-purple-800 rounded-full w-44 h-44 animate-ping" style={{ animationDelay: '0.5s' }}></div>
        </div>
      </div>

      <div className="space-y-4 text-center">
        <h3 className="font-bold text-gray-900 dark:text-white text-2xl animate-pulse">
          {message || t('msg.searching')}
        </h3>
        
        <div className="flex justify-center space-x-2">
          <div className="bg-blue-500 rounded-full w-3 h-3 animate-bounce"></div>
          <div className="bg-purple-500 rounded-full w-3 h-3 animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="bg-pink-500 rounded-full w-3 h-3 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>

        <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-64 h-2 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full h-full animate-pulse"></div>
        </div>
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute opacity-10 dark:opacity-5 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${3 + Math.random() * 2}s`,
            }}
          >
            <BookOpen className="w-8 h-8 text-gray-400" />
          </div>
        ))}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-float {
          animation: float 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
} 