'use client';

import { useEffect, useState } from 'react';

interface ProgressBarProps {
  value: number;
  maxValue?: number; // Keep for backward compatibility but not used with milestone system
  color: 'red' | 'yellow' | 'blue' | 'gray';
  label: string;
  icon?: React.ReactNode;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'gradient' | 'outlined';
  className?: string;
}

export function ProgressBar({ 
  value, 
  color, 
  label, 
  icon,
  showValue = true, 
  size = 'md',
  variant = 'gradient',
  className = '' 
}: ProgressBarProps) {
  const [animatedWidth, setAnimatedWidth] = useState(0);
  
  // Milestone-based progress calculation
  const milestones = [100, 500, 1000, 5000, 10000, 50000];
  
  const getMilestoneProgress = (value: number) => {
    if (value === 0) return { percentage: 0, milestone: milestones[0], isMax: false };
    
    // Find the appropriate milestone
    let targetMilestone = milestones[0];
    let previousMilestone = 0;
    
    for (let i = 0; i < milestones.length; i++) {
      if (value <= milestones[i]) {
        targetMilestone = milestones[i];
        previousMilestone = i > 0 ? milestones[i - 1] : 0;
        break;
      }
    }
    
    // If value exceeds the highest milestone
    if (value > milestones[milestones.length - 1]) {
      return { 
        percentage: 100, 
        milestone: milestones[milestones.length - 1], 
        isMax: true 
      };
    }
    
    // Calculate progress within the current milestone range
    const progressInRange = value - previousMilestone;
    const rangeSize = targetMilestone - previousMilestone;
    const percentage = (progressInRange / rangeSize) * 100;
    
    return { percentage, milestone: targetMilestone, isMax: false };
  };
  
  const { percentage, milestone, isMax } = getMilestoneProgress(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedWidth(percentage);
    }, 200);
    return () => clearTimeout(timer);
  }, [percentage]);

  const formatNumber = (num: number) => {
    if (num >= 10000) {
      return `${(num / 10000).toFixed(1)}万`;
    }
    return num.toLocaleString();
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return { 
          bar: 'h-1.5', 
          text: 'text-xs',
          container: 'py-1'
        };
      case 'lg':
        return { 
          bar: 'h-3', 
          text: 'text-sm font-medium',
          container: 'py-2'
        };
      default:
        return { 
          bar: 'h-2', 
          text: 'text-xs',
          container: 'py-1.5'
        };
    }
  };

  const getColorClasses = () => {
    const baseClasses = variant === 'gradient' ? 'bg-gradient-to-r' : '';
    
    switch (color) {
      case 'red':
        return variant === 'gradient' 
          ? `${baseClasses} from-red-400 to-red-600`
          : 'bg-red-500';
      case 'yellow':
        return variant === 'gradient' 
          ? `${baseClasses} from-yellow-400 to-yellow-600`
          : 'bg-yellow-500';
      case 'blue':
        return variant === 'gradient' 
          ? `${baseClasses} from-blue-400 to-blue-600`
          : 'bg-blue-500';
      case 'gray':
        return variant === 'gradient' 
          ? `${baseClasses} from-gray-400 to-gray-600`
          : 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBackgroundClasses = () => {
    if (variant === 'outlined') {
      return 'bg-gray-100 border border-gray-200';
    }
    return 'bg-gray-100';
  };

  const sizeClasses = getSizeClasses();

  return (
    <div className={`${sizeClasses.container} ${className}`}>
      <div className="flex items-center justify-between mb-1">
        <div className={`flex items-center space-x-2 ${sizeClasses.text} text-gray-700 font-medium`}>
          {icon && <span className="flex-shrink-0">{icon}</span>}
          <span>{label}</span>
        </div>
        {showValue && (
          <div className="text-right">
            <div className={`${sizeClasses.text} font-bold text-gray-900`}>
              {formatNumber(value)}
            </div>
            {!isMax && value > 0 && (
              <div className="text-xs text-gray-500">
                /{formatNumber(milestone)}
              </div>
            )}
            {isMax && (
              <div className="text-xs text-green-600 font-medium">
                MAX
              </div>
            )}
          </div>
        )}
      </div>
      <div className="relative">
        <div className={`w-full rounded-full ${sizeClasses.bar} ${getBackgroundClasses()}`}>
          <div
            className={`${sizeClasses.bar} rounded-full transition-all duration-1000 ease-out shadow-sm ${getColorClasses()}`}
            style={{ width: `${animatedWidth}%` }}
          />
        </div>
        {size === 'lg' && percentage > 10 && (
          <div 
            className="absolute inset-y-0 left-0 flex items-center text-white text-xs font-bold pl-2"
            style={{ width: `${animatedWidth}%` }}
          >
            {percentage >= 20 && `${Math.round(percentage)}%`}
          </div>
        )}
      </div>
    </div>
  );
}