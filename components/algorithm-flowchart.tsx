'use client';

import { ArrowRight, XCircle, TrendingUp, TrendingDown } from 'lucide-react';

export function AlgorithmFlowchart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Xiaohongshu Algorithm Flow</h3>
        <p className="text-gray-700">
          How your content travels through the recommendation system
        </p>
      </div>

      {/* Horizontal Flow - Desktop */}
      <div className="hidden lg:block">
        <div className="flex items-center justify-between space-x-4 mb-12">
          {/* Step 1: Note Publication */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-center shadow-sm">
              <div className="font-semibold text-gray-900">📝 Publication</div>
              <div className="text-xs text-gray-600 mt-1">User publishes</div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400" />

          {/* Step 2: Review */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-center shadow-sm">
              <div className="font-semibold text-gray-900">🔍 Review</div>
              <div className="text-xs text-gray-600 mt-1">Content check</div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400" />

          {/* Step 3: Tag Classification */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-center shadow-sm">
              <div className="font-semibold text-gray-900">🏷️ Tagging</div>
              <div className="text-xs text-gray-600 mt-1">Categorization</div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400" />

          {/* Step 4: Initial Pool */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-100 border border-gray-300 px-4 py-3 rounded-lg text-center shadow-sm">
              <div className="font-semibold text-gray-900">🎯 Initial Pool</div>
              <div className="text-xs text-gray-600 mt-1">200-500 views</div>
            </div>
          </div>

          <ArrowRight className="w-5 h-5 text-gray-400" />

          {/* Step 5: CES Score */}
          <div className="flex flex-col items-center">
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg text-center shadow-sm">
              <div className="font-semibold">📊 CES Score</div>
              <div className="text-xs mt-1">Engagement calc</div>
            </div>
          </div>
        </div>

        {/* Decision Outcomes */}
        <div className="grid grid-cols-3 gap-6">
          {/* Rejected */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <XCircle className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <div className="font-medium text-gray-700 mb-1">Rejected</div>
            <div className="text-xs text-gray-600">Followers only</div>
          </div>

          {/* Low CES */}
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <TrendingDown className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <div className="font-medium text-gray-700 mb-1">Low CES</div>
            <div className="text-xs text-gray-600">Limited reach</div>
          </div>

          {/* High CES */}
          <div className="text-center p-4 bg-gray-900 text-white rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium mb-1">High CES</div>
            <div className="text-xs">Viral potential</div>
          </div>
        </div>
      </div>

      {/* Vertical Flow - Mobile */}
      <div className="lg:hidden space-y-6">
        {/* Mobile vertical layout for smaller screens */}
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-gray-100 border border-gray-300 px-6 py-4 rounded-lg text-center w-full max-w-xs">
            <div className="font-semibold text-gray-900">📝 Note Publication</div>
            <div className="text-sm text-gray-600 mt-1">User publishes content</div>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <div className="bg-gray-100 border border-gray-300 px-6 py-4 rounded-lg text-center w-full max-w-xs">
            <div className="font-semibold text-gray-900">🔍 Content Review</div>
            <div className="text-sm text-gray-600 mt-1">Platform guideline check</div>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <div className="bg-gray-100 border border-gray-300 px-6 py-4 rounded-lg text-center w-full max-w-xs">
            <div className="font-semibold text-gray-900">🏷️ Tag Classification</div>
            <div className="text-sm text-gray-600 mt-1">Content categorization</div>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <div className="bg-gray-100 border border-gray-300 px-6 py-4 rounded-lg text-center w-full max-w-xs">
            <div className="font-semibold text-gray-900">🎯 Initial Traffic Pool</div>
            <div className="text-sm text-gray-600 mt-1">200-500 initial views</div>
          </div>
          
          <div className="w-px h-6 bg-gray-300"></div>
          
          <div className="bg-gray-900 text-white px-6 py-4 rounded-lg text-center w-full max-w-xs">
            <div className="font-semibold">📊 CES Score Calculation</div>
            <div className="text-sm mt-1">Engagement metrics analysis</div>
          </div>
        </div>

        {/* Mobile outcomes */}
        <div className="grid grid-cols-1 gap-4 mt-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <XCircle className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <div className="font-medium text-gray-700 mb-1">Content Rejected</div>
            <div className="text-sm text-gray-600">Only visible to followers</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg border border-gray-200">
            <TrendingDown className="w-6 h-6 text-gray-500 mx-auto mb-2" />
            <div className="font-medium text-gray-700 mb-1">Low CES Score</div>
            <div className="text-sm text-gray-600">Limited recommendations</div>
          </div>
          
          <div className="text-center p-4 bg-gray-900 text-white rounded-lg">
            <TrendingUp className="w-6 h-6 mx-auto mb-2" />
            <div className="font-medium mb-1">High CES Score</div>
            <div className="text-sm">Next traffic pool → Viral potential</div>
          </div>
        </div>
      </div>

      {/* Key Formula */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 mt-8">
        <h4 className="text-lg font-bold text-gray-900 mb-4 text-center">
          🎯 CES Scoring Formula
        </h4>
        <div className="text-center text-lg font-mono bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-gray-800">
            <span className="text-gray-900 font-semibold">Likes × 1</span> + 
            <span className="text-gray-900 font-semibold"> Saves × 1</span> + 
            <span className="text-gray-900 font-semibold"> Comments × 4</span> + 
            <span className="text-gray-900 font-semibold"> Shares × 4</span> + 
            <span className="text-gray-900 font-semibold"> Follows × 8</span>
          </div>
        </div>
        <p className="text-center text-sm text-gray-700 mt-3">
          Higher weights on community interaction and creator loyalty
        </p>
      </div>
    </div>
  );
}