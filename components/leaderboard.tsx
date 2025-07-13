'use client';

import { useEffect, useState } from 'react';
import { getLeaderboard } from '@/lib/actions';
import { Application, Note } from '@/lib/supabase';

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
          className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (leaderboard.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <p className="text-gray-500">No published application data yet</p>
        <p className="text-sm text-gray-400 mt-2">Be the first app on the leaderboard!</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 gap-0">
        {leaderboard.map((item, index) => (
          <div
            key={item.id}
            className={`p-6 border-b border-gray-200 last:border-b-0 ${
              index === 0 ? 'bg-yellow-50' : index === 1 ? 'bg-gray-50' : index === 2 ? 'bg-orange-50' : ''
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  index === 0 ? 'bg-yellow-400 text-yellow-900' :
                  index === 1 ? 'bg-gray-400 text-gray-900' :
                  index === 2 ? 'bg-orange-400 text-orange-900' :
                  'bg-gray-200 text-gray-700'
                }`}>
                  {index + 1}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {item.url}
                  </p>
                  {item.twitter_id && (
                    <p className="text-sm text-blue-600">
                      @{item.twitter_id}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-6 text-right">
                <div>
                  <p className="text-sm text-gray-500">Total Engagement</p>
                  <p className="text-xl font-bold text-gray-900">
                    {formatNumber(item.total_engagement)}
                  </p>
                </div>
                {item.note && (
                  <>
                    <div>
                      <p className="text-sm text-gray-500">Likes</p>
                      <p className="text-lg font-semibold text-red-600">
                        {formatNumber(item.note?.likes_count)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Saves</p>
                      <p className="text-lg font-semibold text-yellow-600">
                        {formatNumber(item.note?.collects_count)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Comments</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {formatNumber(item.note?.comments_count)}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {item.note?.url && (
              <div className="mt-4">
                <a
                  href={item.note?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                >
                  View Xiaohongshu Post →
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}