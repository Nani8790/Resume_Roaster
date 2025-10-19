import React from 'react';
import ProgressIndicator from './ProgressIndicator';
import ProgressBar from './ProgressBar';

const ScoreCard = ({ 
  title, 
  score, 
  description, 
  type = 'circular', 
  size = 'md',
  className = '',
  showTrend = false,
  trendValue = 0,
  icon: Icon
}) => {
  const getTrendColor = (trend) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getTrendIcon = (trend) => {
    if (trend > 0) return '↗';
    if (trend < 0) return '↘';
    return '→';
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          {Icon && <Icon className="h-6 w-6 text-purple-600" />}
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
        {showTrend && trendValue !== 0 && (
          <div className={`flex items-center space-x-1 ${getTrendColor(trendValue)}`}>
            <span className="text-sm font-medium">
              {getTrendIcon(trendValue)} {Math.abs(trendValue)}%
            </span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-center mb-4">
        {type === 'circular' ? (
          <ProgressIndicator score={score} size={size} />
        ) : (
          <div className="w-full">
            <ProgressBar 
              score={score} 
              height="h-4" 
              showGradient={true}
              animated={true}
            />
            <div className="text-center mt-3">
              <span className="text-3xl font-bold text-gray-900">{score}</span>
              <span className="text-lg text-gray-500">/100</span>
            </div>
          </div>
        )}
      </div>

      {description && (
        <p className="text-sm text-gray-600 text-center">{description}</p>
      )}
    </div>
  );
};

export default ScoreCard;