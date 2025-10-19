import React from 'react';

const ProgressIndicator = ({ 
  score, 
  size = 'md', 
  showLabel = true, 
  className = '',
  color = 'auto',
  strokeWidth = 8,
  animated = true 
}) => {
  const getScoreColor = (score) => {
    if (color !== 'auto') return color;
    if (score >= 85) return '#10B981'; // Green
    if (score >= 70) return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  const getScoreLabel = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 70) return 'Good';
    return 'Needs Work';
  };

  const sizes = {
    sm: { width: 80, height: 80, radius: 30, fontSize: 'text-lg' },
    md: { width: 120, height: 120, radius: 45, fontSize: 'text-2xl' },
    lg: { width: 160, height: 160, radius: 60, fontSize: 'text-3xl' },
    xl: { width: 200, height: 200, radius: 75, fontSize: 'text-4xl' }
  };

  const { width, height, radius, fontSize } = sizes[size];
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg 
        width={width} 
        height={height} 
        className="transform -rotate-90"
        viewBox={`0 0 ${width} ${height}`}
      >
        {/* Background circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke="#E5E7EB"
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <circle
          cx={width / 2}
          cy={height / 2}
          r={radius}
          stroke={getScoreColor(score)}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className={animated ? 'transition-all duration-1000 ease-out' : ''}
          style={{
            filter: 'drop-shadow(0 0 6px rgba(0,0,0,0.1))'
          }}
        />
      </svg>
      
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <div className={`${fontSize} font-bold text-gray-900`}>
            {score}
          </div>
          {showLabel && (
            <div className="text-xs text-gray-500 mt-1">
              {getScoreLabel(score)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;