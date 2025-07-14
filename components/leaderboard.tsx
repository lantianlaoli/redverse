'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import Image from 'next/image';
import { ScrollAnimation } from './scroll-animation';

interface LeaderboardItem extends Application {
  note?: Note; // Single note object, not array
  total_engagement: number;
}

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getLeaderboard();
      
      if (result.success && result.leaderboard) {
        setLeaderboard(result.leaderboard);
      } else {
        setError(result.error || 'Failed to fetch leaderboard');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num: number | null) => {
    if (!num) return '0';
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading leaderboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 rounded-lg p-8 text-center">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchLeaderboard}
          className="mt-2 text-sm text-red-700 hover:text-red-900 underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <ScrollAnimation animation="fadeIn">
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-500">No published application data yet</p>
          <p className="text-sm text-gray-400 mt-2">Be the first app on the leaderboard!</p>
        </div>
      </ScrollAnimation>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leaderboard.map((item, index) => (
        <ScrollAnimation key={item.id} animation="fadeInUp" delay={index * 100}>
          <div
            className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-300 hover-lift"
          >
          <div className="flex items-start space-x-4">
            {/* Product Thumbnail */}
            <div className="flex-shrink-0 relative">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                {item.thumbnail ? (
                  <Image
                    src={item.thumbnail}
                    alt={item.name || 'Product thumbnail'}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400 text-xs">No Image</span>
                  </div>
                )}
              </div>
              {/* Ranking Badge */}
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                index === 0 ? 'bg-yellow-400 text-yellow-900' :
                index === 1 ? 'bg-gray-400 text-gray-900' :
                index === 2 ? 'bg-orange-400 text-orange-900' :
                'bg-gray-200 text-gray-700'
              }`}>
                {index + 1}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {item.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                AI Application
              </p>
              {item.twitter_id && (
                <p className="text-sm text-blue-600 mt-1">
                  @{item.twitter_id}
                </p>
              )}
              
              {/* Engagement Stats */}
              <div className="mt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Engagement</span>
                  <span className="font-semibold text-gray-900">
                    {formatNumber(item.total_engagement)}
                  </span>
                </div>
                {item.note && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Likes</span>
                      <span className="font-semibold text-red-600">
                        {formatNumber(item.note?.likes_count)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Saves</span>
                      <span className="font-semibold text-yellow-600">
                        {formatNumber(item.note?.collects_count)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Comments</span>
                      <span className="font-semibold text-blue-600">
                        {formatNumber(item.note?.comments_count)}
                      </span>
                    </div>
                  </>
                )}
              </div>
              
              {/* Link to Xiaohongshu Post */}
              {item.note?.url && (
                <div className="mt-4">
                  <a
                    href={item.note?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
                  >
                    View Post →
                  </a>
                </div>
              )}
            </div>
          </div>
          </div>
        </ScrollAnimation>
      ))}
    </div>
  );
}