'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Eye, Search, Compass, Users } from 'lucide-react';

const data = [
  { 
    name: 'Discover Page', 
    value: 75, 
    color: '#374151',
    description: 'Algorithmic recommendation engine',
    icon: Compass
  },
  { 
    name: 'Search Page', 
    value: 15, 
    color: '#6b7280',
    description: 'User-initiated searches',
    icon: Search
  },
  { 
    name: 'Following Page', 
    value: 10, 
    color: '#9ca3af',
    description: 'Follower feeds',
    icon: Users
  },
];

const RADIAN = Math.PI / 180;

interface CustomLabelProps {
  cx: number;
  cy: number;
  midAngle?: number;
  innerRadius: number;
  outerRadius: number;
  percent?: number;
  index?: number;
}

const renderCustomizedLabel = ({
  cx, cy, midAngle, innerRadius, outerRadius, percent
}: CustomLabelProps) => {
  if (midAngle === undefined || percent === undefined) return null;
  
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text 
      x={x} 
      y={y} 
      fill="white" 
      textAnchor={x > cx ? 'start' : 'end'} 
      dominantBaseline="central"
      className="text-sm font-semibold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: typeof data[0];
  }>;
}

const CustomTooltip = ({ active, payload }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-lg border border-gray-200">
        <div className="flex items-center mb-2">
          <data.icon className="w-4 h-4 mr-2" style={{ color: data.color }} />
          <p className="font-semibold text-gray-900">{data.name}</p>
        </div>
        <p className="text-sm text-gray-700 mb-1">{data.description}</p>
        <p className="text-lg font-bold text-gray-900">
          {data.value}% of total traffic
        </p>
      </div>
    );
  }
  return null;
};

export function TrafficSourcesChart() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl mb-4">
          <Eye className="w-6 h-6 text-gray-700" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Traffic Sources Distribution</h3>
        <p className="text-gray-700">
          Understanding where your Xiaohongshu note views come from
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={renderCustomizedLabel}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend and Details */}
        <div className="space-y-6">
          {data.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <div key={index} className="flex items-start space-x-4">
                <div 
                  className="flex items-center justify-center w-10 h-10 rounded-lg"
                  style={{ backgroundColor: `${item.color}20` }}
                >
                  <IconComponent className="w-5 h-5" style={{ color: item.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-semibold text-gray-900">{item.name}</h4>
                    <span 
                      className="text-lg font-bold"
                      style={{ color: item.color }}
                    >
                      {item.value}%
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{item.description}</p>
                  
                  {/* Strategy Tips */}
                  <div className="mt-2">
                    {item.name === 'Discover Page' && (
                      <p className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        💡 Focus on high CES scores for viral potential
                      </p>
                    )}
                    {item.name === 'Search Page' && (
                      <p className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        💡 Optimize with relevant keywords for long-tail traffic
                      </p>
                    )}
                    {item.name === 'Following Page' && (
                      <p className="text-xs text-gray-700 bg-gray-50 px-2 py-1 rounded">
                        💡 Build loyal follower base for stable traffic
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Key Insight */}
          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h5 className="font-semibold text-gray-900 mb-2">Key Insight</h5>
            <p className="text-sm text-gray-700">
              The <strong>Discover Page</strong> dominates traffic distribution, making 
              algorithm optimization crucial for growth. While <strong>Following</strong> and 
              <strong>Search</strong> provide targeted traffic, viral success depends on 
              mastering the recommendation algorithm.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}