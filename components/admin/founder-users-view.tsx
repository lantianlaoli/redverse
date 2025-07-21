'use client';

import { useState, useEffect } from 'react';
import { getApplicationsByFounder } from '@/lib/actions';
import { Application } from '@/lib/supabase';
import { Users, Calendar, ExternalLink, FileText, Eye } from 'lucide-react';

interface FounderGroup {
  founderUrl: string;
  applications: Application[];
  totalCount: number;
}

export function FounderUsersView() {
  const [founderGroups, setFounderGroups] = useState<FounderGroup[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchFounderGroups();
  }, []);

  const fetchFounderGroups = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      const result = await getApplicationsByFounder();
      
      if (result.success && result.founderGroups) {
        setFounderGroups(result.founderGroups);
      } else {
        setError(result.error || 'Failed to fetch Founder groups');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleGroup = (founderUrl: string) => {
    const newExpanded = new Set(expandedGroups);
    if (newExpanded.has(founderUrl)) {
      newExpanded.delete(founderUrl);
    } else {
      newExpanded.add(founderUrl);
    }
    setExpandedGroups(newExpanded);
  };


  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading Founder accounts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <button 
          onClick={fetchFounderGroups}
          className="text-sm text-red-700 hover:text-red-900 underline cursor-pointer"
        >
          Try again
        </button>
      </div>
    );
  }

  if (founderGroups.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Founder Users</h1>
          <p className="text-gray-600">Applications grouped by Founder user</p>
        </div>
        
        <div className="text-center py-20">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Founder users yet</h3>
          <p className="text-gray-500 max-w-sm mx-auto">
            Founder users will be grouped here once applications with social accounts are submitted.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Founder Users</h1>
        <p className="text-gray-600">Applications grouped by Founder user</p>
        <div className="mt-4 text-sm text-gray-500">
          Total users: {founderGroups.length} • Total applications: {founderGroups.reduce((sum, group) => sum + group.totalCount, 0)}
        </div>
      </div>

      {/* Founder Users Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {founderGroups.map((group) => (
          <div key={group.founderUrl} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            {/* Card Header */}
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm">
                  <Users className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    <a href={group.founderUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">
                      Founder Profile
                    </a>
                  </h3>
                  <p className="text-sm text-gray-600">
                    Social Profile
                  </p>
                </div>
              </div>
              
              {/* Stats */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-500">
                  <span className="flex items-center">
                    <FileText className="w-4 h-4 mr-1" />
                    {group.totalCount} application{group.totalCount !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <button
                  onClick={() => toggleGroup(group.founderUrl)}
                  className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  {expandedGroups.has(group.founderUrl) ? 'Hide' : 'View'}
                </button>
              </div>
            </div>

            {/* Expanded Applications */}
            {expandedGroups.has(group.founderUrl) && (
              <div className="border-t border-gray-200 p-6">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Applications</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {group.applications.map((app) => (
                    <div key={app.id} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h5 className="text-sm font-medium text-gray-900 truncate">
                            {app.name || 'Untitled Application'}
                          </h5>
                          <a 
                            href={app.url || '#'} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 flex-shrink-0"
                          >
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded">
                          Active
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}