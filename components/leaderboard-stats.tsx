'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface StatsData {
  totalApps: number;
  totalReach: string;
  successRate: string;
}

export function LeaderboardStats() {
  const [stats, setStats] = useState<StatsData>({
    totalApps: 0,
    totalReach: '300M+',
    successRate: '95%'
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      
      // Get total number of applications
      const { count, error } = await supabase
        .from('applications')
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.error('Error fetching stats:', error);
        // Use fallback data
        setStats({
          totalApps: 50,
          totalReach: '300M+',
          successRate: '95%'
        });
      } else {
        setStats({
          totalApps: count || 0,
          totalReach: '300M+',
          successRate: '95%'
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      // Use fallback data
      setStats({
        totalApps: 50,
        totalReach: '300M+',
        successRate: '95%'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {isLoading ? '...' : stats.totalReach}
        </div>
        <div className="text-gray-600">Total Reach</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {isLoading ? '...' : `${stats.totalApps}+`}
        </div>
        <div className="text-gray-600">Apps Launched</div>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-gray-900 mb-2">
          {isLoading ? '...' : stats.successRate}
        </div>
        <div className="text-gray-600">Success Rate</div>
      </div>
    </div>
  );
}