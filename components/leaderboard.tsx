'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import Image from 'next/image';
import { ScrollAnimation } from './scroll-animation';
import { TrendingUpIcon, HeartIcon, BookmarkIcon, MessageCircleIcon, TwitterIcon } from './icons';

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

  // No need for max values calculation with milestone-based progress

  return (
    <div>
      <div className="space-y-6">
        {leaderboard.map((item, index) => (
          <ScrollAnimation key={item.id} animation="fadeInUp" delay={index * 100}>
            <div className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-xl transition-all duration-300 hover-lift">
              <div className="flex items-start space-x-6">
                {/* Ranking and Thumbnail */}
                <div className="flex-shrink-0 flex items-center space-x-4">
                  {/* Ranking Number */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                    index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white' :
                    index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-600 text-white' :
                    index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-white' :
                    'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700'
                  }`}>
                    {index + 1}
                  </div>
                  
                  {/* Product Thumbnail */}
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-sm">
                    {item.thumbnail ? (
                      <Image
                        src={item.thumbnail}
                        alt={item.name || 'Product thumbnail'}
                        width={80}
                        height={80}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Content and Progress Bars */}
                <div className="flex-1 min-w-0">
                  {/* Product Info */}
                  <div className="mb-6">
                    <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
                      {item.name}
                    </h3>
                    {item.twitter_id && (
                      <div className="flex items-center space-x-2 mt-1">
                        <TwitterIcon className="w-4 h-4 text-blue-500" />
                        <a
                          href={`https://x.com/${item.twitter_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 font-medium hover:text-blue-800 hover:underline transition-colors"
                        >
                          @{item.twitter_id}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Progress Bars */}
                  {item.note && (
                    <div className="space-y-3">
                      {/* Total Engagement - Most Prominent */}
                      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl p-3 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <TrendingUpIcon className="w-5 h-5 text-gray-600" />
                            <span className="text-sm font-bold text-gray-900">Total Engagement</span>
                          </div>
                          <div className="text-3xl font-bold text-gray-900">
                            {item.total_engagement.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      {/* Individual Metrics */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <div className="bg-red-50 rounded-lg p-2 border border-red-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <HeartIcon className="w-4 h-4 text-red-500" />
                              <span className="text-xs font-medium text-gray-700">Likes</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {(item.note.likes_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <BookmarkIcon className="w-4 h-4 text-yellow-600" />
                              <span className="text-xs font-medium text-gray-700">Saves</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {(item.note.collects_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <MessageCircleIcon className="w-4 h-4 text-blue-500" />
                              <span className="text-xs font-medium text-gray-700">Comments</span>
                            </div>
                            <span className="text-lg font-bold text-gray-900">
                              {(item.note.comments_count || 0).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {(item.url || item.note?.url) && (
                    <div className="mt-4 flex justify-end space-x-3">
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                        >
                          <span>View Project</span>
                          <span>→</span>
                        </a>
                      )}
                      {item.note?.url && (
                        <a
                          href={item.note?.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <span>View Post</span>
                          <span>→</span>
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollAnimation>
        ))}
      </div>
    </div>
  );
}