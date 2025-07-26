'use client';

import { useState } from 'react';
import { Calculator, TrendingUp } from 'lucide-react';

export function CESCalculator() {
  const [likes, setLikes] = useState(0);
  const [saves, setSaves] = useState(0);
  const [comments, setComments] = useState(0);
  const [shares, setShares] = useState(0);
  const [follows, setFollows] = useState(0);

  const calculateCES = () => {
    return likes * 1 + saves * 1 + comments * 4 + shares * 4 + follows * 8;
  };

  const cesScore = calculateCES();

  const getScoreLevel = (score: number) => {
    if (score >= 1000) return { level: 'Viral Potential', color: 'text-gray-900', bg: 'bg-gray-900 text-white' };
    if (score >= 500) return { level: 'High Engagement', color: 'text-gray-800', bg: 'bg-gray-100 border-gray-300' };
    if (score >= 200) return { level: 'Good Performance', color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' };
    if (score >= 50) return { level: 'Average', color: 'text-gray-600', bg: 'bg-gray-50 border-gray-200' };
    return { level: 'Low Engagement', color: 'text-gray-500', bg: 'bg-gray-50 border-gray-200' };
  };

  const scoreLevel = getScoreLevel(cesScore);

  const inputFields = [
    { label: 'Likes', value: likes, setter: setLikes, multiplier: 1, icon: '👍', max: 1000 },
    { label: 'Saves', value: saves, setter: setSaves, multiplier: 1, icon: '🔖', max: 500 },
    { label: 'Comments', value: comments, setter: setComments, multiplier: 4, icon: '💬', max: 200 },
    { label: 'Shares', value: shares, setter: setShares, multiplier: 4, icon: '📤', max: 100 },
    { label: 'New Follows', value: follows, setter: setFollows, multiplier: 8, icon: '👥', max: 50 },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
          <Calculator className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">CES Score Calculator</h3>
        <p className="text-gray-700">
          Experience how Xiaohongshu&apos;s Community Engagement Score works
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Input Your Metrics</h4>
          {inputFields.map((field) => (
            <div key={field.label} className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center text-sm font-medium text-gray-800">
                  <span className="mr-2 text-lg">{field.icon}</span>
                  {field.label}
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-600">×{field.multiplier}</span>
                  <span className="text-sm font-medium text-gray-900 min-w-[3rem] text-right">
                    {field.value}
                  </span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max={field.max}
                  value={field.value}
                  onChange={(e) => field.setter(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-1">
                  <span>0</span>
                  <span className="text-gray-900 font-medium">
                    Score: {field.value * field.multiplier}
                  </span>
                  <span>{field.max}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          <div className="text-center">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Your CES Score</h4>
            <div className={`${scoreLevel.bg} border-2 rounded-xl p-6`}>
              <div className="text-4xl font-bold mb-2 text-gray-900">
                {cesScore.toLocaleString()}
              </div>
              <div className={`text-lg font-semibold ${scoreLevel.color}`}>
                {scoreLevel.level}
              </div>
            </div>
          </div>

          {/* Formula Breakdown */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-semibold text-gray-900 mb-3">Formula Breakdown</h5>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex justify-between">
                <span>Likes × 1:</span>
                <span className="font-medium text-gray-900">{likes}</span>
              </div>
              <div className="flex justify-between">
                <span>Saves × 1:</span>
                <span className="font-medium text-gray-900">{saves}</span>
              </div>
              <div className="flex justify-between">
                <span>Comments × 4:</span>
                <span className="font-medium text-gray-900">{comments * 4}</span>
              </div>
              <div className="flex justify-between">
                <span>Shares × 4:</span>
                <span className="font-medium text-gray-900">{shares * 4}</span>
              </div>
              <div className="flex justify-between">
                <span>Follows × 8:</span>
                <span className="font-medium text-gray-900">{follows * 8}</span>
              </div>
              <div className="border-t pt-2 flex justify-between font-semibold text-gray-900">
                <span>Total CES Score:</span>
                <span>{cesScore}</span>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <TrendingUp className="w-4 h-4 text-gray-700 mr-2" />
              <h5 className="text-sm font-semibold text-gray-900">Pro Tip</h5>
            </div>
            <p className="text-sm text-gray-700">
              {cesScore < 50 && "Focus on creating engaging content that encourages comments and shares."}
              {cesScore >= 50 && cesScore < 200 && "Great start! Try to boost interaction by asking questions in your posts."}
              {cesScore >= 200 && cesScore < 500 && "Good engagement! Consider strategies to convert viewers into followers."}
              {cesScore >= 500 && cesScore < 1000 && "Excellent performance! Your content is resonating well with audiences."}
              {cesScore >= 1000 && "Outstanding! Your content has viral potential and high community value."}
            </p>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }

        .slider::-webkit-slider-thumb:hover {
          background: #111827;
          transform: scale(1.1);
        }

        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #374151;
          border: 2px solid #fff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          cursor: pointer;
          border: none;
        }

        .slider::-moz-range-thumb:hover {
          background: #111827;
          transform: scale(1.1);
        }

        .slider:focus {
          outline: none;
        }

        .slider:focus::-webkit-slider-thumb {
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
      `}</style>
    </div>
  );
}