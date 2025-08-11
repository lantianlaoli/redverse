'use client';

import { useEffect, useState, useCallback } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';
import { ScrollAnimation } from './scroll-animation';
import { TrendingUpIcon, HeartIcon, EyeIcon, BookmarkIcon, MessageCircleIcon, ShareIcon, ExternalLinkIcon, UserIcon, XiaohongshuIcon } from '@/components/icons';
import Image from 'next/image';

interface LeaderboardItem extends Application {
  notes?: Note; // Single note object, not array
  total_engagement: number;
}

interface LeaderboardProps {
  limit?: number; // Optional limit for number of items to display
}

export function Leaderboard({ limit }: LeaderboardProps) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchLeaderboard = useCallback(async (retryAttempt = 0) => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getLeaderboard();
      
      if (result.success && result.leaderboard) {
        setLeaderboard(result.leaderboard);
      } else {
        // Auto-retry up to 2 times before showing error
        if (retryAttempt < 2) {
          setTimeout(() => fetchLeaderboard(retryAttempt + 1), 1000 * (retryAttempt + 1));
          return;
        }
        setError('Unable to load leaderboard data');
      }
    } catch {
      // Auto-retry up to 2 times before showing error
      if (retryAttempt < 2) {
        setTimeout(() => fetchLeaderboard(retryAttempt + 1), 1000 * (retryAttempt + 1));
        return;
      }
      setError('Unable to load leaderboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);


  if (isLoading) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">Loading leaderboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="mb-4">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-4">Leaderboard temporarily unavailable</p>
          <button 
            onClick={() => fetchLeaderboard(0)}
            disabled={isLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Try again
              </>
            )}
          </button>
        </div>
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

  // Apply limit if specified
  const displayItems = limit ? leaderboard.slice(0, limit) : leaderboard;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {displayItems.map((item, index) => (
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
              {/* Top Row: CES Score */}
              <div className="flex justify-end items-start mb-4">
                {/* CES Score in top-right */}
                {item.notes && (
                  <div className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-50 border border-gray-200">
                    <TrendingUpIcon className="w-3 h-3 text-gray-600 mr-1" />
                    <span className="text-xs font-medium text-gray-700">
                      CES {item.total_engagement.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Engagement Metrics */}
              {item.notes && (
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    <HeartIcon className="w-3 h-3 mr-1" />
                    {(item.notes.likes_count || 0).toLocaleString()} likes
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <EyeIcon className="w-3 h-3 mr-1" />
                    {(item.notes.views_count || 0).toLocaleString()} views
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    <BookmarkIcon className="w-3 h-3 mr-1" />
                    {(item.notes.collects_count || 0).toLocaleString()} saves
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    <ShareIcon className="w-3 h-3 mr-1" />
                    {(item.notes.shares_count || 0).toLocaleString()} shares
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
                    <MessageCircleIcon className="w-3 h-3 mr-1" />
                    {(item.notes.comments_count || 0).toLocaleString()} comments
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
                    className="btn-secondary-outline px-3 py-2 text-sm"
                  >
                    <ExternalLinkIcon className="w-3 h-3 mr-1.5" />
                    Project
                  </a>
                ) : (
                  <div className="inline-flex items-center justify-center px-3 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-400 bg-gray-50 cursor-not-allowed">
                    <ExternalLinkIcon className="w-3 h-3 mr-1.5 text-gray-300" />
                    Coming Soon
                  </div>
                )}

                {/* Xiaohongshu Link */}
                {item.notes?.url ? (
                  <a
                    href={item.notes.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary-black px-3 py-2 text-sm"
                  >
                    <XiaohongshuIcon className="w-3 h-3 mr-1.5" />
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
                    className="btn-secondary-outline px-3 py-2 text-sm"
                  >
                    <UserIcon className="w-3 h-3 mr-1.5" />
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