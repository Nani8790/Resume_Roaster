import React from 'react';

const ProgressBar = ({ 
  score, 
  label, 
  showScore = true, 
  height = 'h-3', 
  className = '',
  color = 'auto',
  animated = true,
  showGradient = false 
}) => {
  const getScoreColor = (score) => {
    if (color !== 'auto') return color;
    if (score >= 85) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreGradient = (score) => {
    if (score >= 85) return 'from-green-400 to-green-600';
    if (score >= 70) return 'from-yellow-400 to-yellow-600';
    return 'from-red-400 to-red-600';
  };

  const scoreColor = getScoreColor(score);
  const gradientClass = getScoreGradient(score);

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700">{label}</span>
          {showScore && (
            <span className="text-sm font-bold text-gray-900">{score}/100</span>
          )}
        </div>
      )}
      
      <div className={`w-full bg-gray-200 rounded-full ${height} overflow-hidden progress-glow`}>
        <div
          className={`${height} rounded-full transition-all duration-1000 ease-out ${
            showGradient ? `bg-gradient-to-r ${gradientClass}` : ''
          } ${animated ? 'animate-pulse-slow' : ''}`}
          style={{
            width: `${Math.min(Math.max(score, 0), 100)}%`,
            backgroundColor: showGradient ? undefined : scoreColor,
            boxShadow: animated ? `0 0 15px ${scoreColor}60, inset 0 1px 0 rgba(255,255,255,0.3)` : 'none',
            animation: animated ? `progressFill 1.5s ease-out` : 'none'
          }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;