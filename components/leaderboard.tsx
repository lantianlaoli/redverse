'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { ScrollAnimation } from './scroll-animation';
import { TrendingUpIcon, HeartIcon, EyeIcon, BookmarkIcon, MessageCircleIcon, TrophyIcon, ExternalLinkIcon, UserIcon, XiaohongshuIcon } from '@/components/icons';
import Image from 'next/image';

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
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {leaderboard.map((item, index) => (
        <ScrollAnimation key={item.id} animation="fadeInUp" delay={index * 100}>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 group">
            {/* Product Image */}
            <div className="relative h-48 bg-gray-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.name || 'Product image'}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-xs text-gray-500">No image</p>
                  </div>
                </div>
              )}
            </div>

            {/* Card Content */}
            <div className="p-6">
              {/* Top Row: Ranking + Total Engagement */}
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  {index < 3 && (
                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                      index === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      index === 1 ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                      'bg-orange-100 text-orange-800 border border-orange-200'
                    }`}>
                      <TrophyIcon className={`w-3 h-3 mr-1 ${
                        index === 0 ? 'text-yellow-600' :
                        index === 1 ? 'text-gray-600' :
                        'text-orange-600'
                      }`} />
                      #{index + 1}
                    </span>
                  )}
                </div>
                
                {/* Total Engagement in top-right */}
                {item.note && (
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border border-purple-200">
                    <TrendingUpIcon className="w-3 h-3 text-purple-600 mr-1" />
                    <span className="text-xs font-medium text-purple-700">
                      {item.total_engagement.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Engagement Metrics */}
              {item.note && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                    <HeartIcon className="w-3 h-3 mr-1" />
                    {(item.note.likes_count || 0).toLocaleString()} likes
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {(item.note.views_count || 0).toLocaleString()} views
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                    <BookmarkIcon className="w-3 h-3 mr-1" />
                    {(item.note.collects_count || 0).toLocaleString()} saves
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                    <MessageCircleIcon className="w-3 h-3 mr-1" />
                    {(item.note.comments_count || 0).toLocaleString()} comments
                  </span>
                </div>
              )}

              {/* Product Name */}
              <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                {item.name}
              </h3>

              {/* Product Explanation */}
              {item.explain && (
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {item.explain}
                </p>
              )}

              {/* Action Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {/* Project Link */}
                {item.url ? (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-gray-900 to-black text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <ExternalLinkIcon className="w-3 h-3 mr-1.5 group-hover:rotate-12 transition-transform duration-200" />
                    Project
                  </a>
                ) : (
                  <div className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                    <ExternalLinkIcon className="w-3 h-3 mr-1.5 text-gray-300" />
                    Coming Soon
                  </div>
                )}

                {/* Xiaohongshu Link */}
                {item.note?.url ? (
                  <a
                    href={item.note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <XiaohongshuIcon className="w-3 h-3 mr-1.5 group-hover:rotate-12 transition-transform duration-200" />
                    Xiaohongshu
                  </a>
                ) : (
                  <div className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                    <XiaohongshuIcon className="w-3 h-3 mr-1.5 text-gray-300" />
                    No Post
                  </div>
                )}

                {/* Founder Link */}
                {item.founder_url ? (
                  <a
                    href={item.founder_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center px-3 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-sm font-medium rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
                  >
                    <UserIcon className="w-3 h-3 mr-1.5 group-hover:rotate-12 transition-transform duration-200" />
                    Founder
                  </a>
                ) : (
                  <div className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                    <UserIcon className="w-3 h-3 mr-1.5 text-gray-300" />
                    No Profile
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