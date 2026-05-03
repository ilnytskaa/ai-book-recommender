'use client';

import { BookOpen, Users, Star, TrendingUp } from 'lucide-react';

interface StatItem {
  icon: React.ReactNode;
  value: string;
  label: string;
  color: string;
}

export default function Stats() {
  const stats: StatItem[] = [
    {
      icon: <BookOpen className="w-8 h-8" />,
      value: "10,000+",
      label: "Books in the database",
      color: "text-blue-600"
    },
    {
      icon: <Users className="w-8 h-8" />,
      value: "5,000+",
      label: "Active users",
      color: "text-green-600"
    },
    {
      icon: <Star className="w-8 h-8" />,
      value: "4.9",
      label: "Average rating",
      color: "text-yellow-600"
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      value: "95%",
      label: "Recommendations accuracy",
      color: "text-purple-600"
    }
  ];

  return (
    <div className="bg-white shadow-lg p-8 rounded-3xl">
      <h3 className="mb-8 font-bold text-gray-900 text-2xl text-center">
        Our achievements
      </h3>
      <div className="gap-6 grid grid-cols-2 md:grid-cols-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center">
            <div className={`flex justify-center mb-3 ${stat.color}`}>
              {stat.icon}
            </div>
            <div className="mb-1 font-bold text-gray-900 text-2xl">
              {stat.value}
            </div>
            <div className="text-gray-600 text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 