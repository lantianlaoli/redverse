'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { ScrollAnimation } from './scroll-animation';
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
              {/* Top Tags */}
              <div className="flex flex-wrap gap-2 mb-4">
                {index < 3 && (
                  <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${
                    index === 0 ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    index === 1 ? 'bg-gray-100 text-gray-800 border border-gray-200' :
                    'bg-orange-100 text-orange-800 border border-orange-200'
                  }`}>
                    #{index + 1}
                  </span>
                )}
                {item.note && (
                  <>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                      {(item.note.likes_count || 0).toLocaleString()} likes
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-yellow-50 text-yellow-700 border border-yellow-200">
                      {(item.note.collects_count || 0).toLocaleString()} saves
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                      {(item.note.comments_count || 0).toLocaleString()} comments
                    </span>
                  </>
                )}
              </div>

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
              <div className="flex gap-2">
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-black text-white text-sm font-medium rounded-md hover:bg-gray-800 transition-colors"
                  >
                    View Project
                  </a>
                )}
                {item.note?.url && (
                  <a
                    href={item.note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    View on Xiaohongshu
                  </a>
                )}
                {item.founder_url && (
                  <a
                    href={item.founder_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 inline-flex items-center justify-center px-3 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
                  >
                    View Founder
                  </a>
                )}
                {!item.url && !item.note?.url && !item.founder_url && (
                  <div className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-200 rounded-md text-sm font-medium text-gray-500 bg-gray-50">
                    Coming Soon
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