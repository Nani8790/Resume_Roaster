import React from 'react';

const SimpleChart = ({ 
  data = [], 
  type = 'line', 
  height = 200, 
  className = '',
  showGrid = true,
  showLabels = true,
  colors = ['#8B5CF6', '#10B981', '#F59E0B', '#EF4444']
}) => {
  if (!data || data.length === 0) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 rounded-lg ${className}`} style={{ height }}>
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => Math.max(...Object.values(d).filter(v => typeof v === 'number'))));
  const minValue = Math.min(...data.map(d => Math.min(...Object.values(d).filter(v => typeof v === 'number'))));
  const range = maxValue - minValue || 1;

  const chartWidth = 400;
  const chartHeight = height - 60; // Leave space for labels
  const padding = 40;

  const getY = (value) => {
    return chartHeight - ((value - minValue) / range) * chartHeight + padding;
  };

  const getX = (index) => {
    return (index / (data.length - 1)) * (chartWidth - 2 * padding) + padding;
  };

  // Get numeric keys (excluding labels like 'date', 'name', etc.)
  const numericKeys = data.length > 0 ? 
    Object.keys(data[0]).filter(key => 
      typeof data[0][key] === 'number' && key !== 'date' && key !== 'name'
    ) : [];

  if (type === 'bar') {
    return (
      <div className={`${className}`}>
        <svg width={chartWidth} height={height} className="w-full">
          {/* Grid lines */}
          {showGrid && (
            <g>
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
                <line
                  key={i}
                  x1={padding}
                  y1={padding + ratio * chartHeight}
                  x2={chartWidth - padding}
                  y2={padding + ratio * chartHeight}
                  stroke="#E5E7EB"
                  strokeWidth="1"
                />
              ))}
            </g>
          )}

          {/* Bars */}
          {data.map((item, index) => {
            const barWidth = (chartWidth - 2 * padding) / data.length * 0.8;
            const x = getX(index) - barWidth / 2;
            
            return numericKeys.map((key, keyIndex) => (
              <rect
                key={`${index}-${key}`}
                x={x + (keyIndex * barWidth / numericKeys.length)}
                y={getY(item[key])}
                width={barWidth / numericKeys.length}
                height={chartHeight - (getY(item[key]) - padding)}
                fill={colors[keyIndex % colors.length]}
                className="hover:opacity-80 transition-opacity"
              />
            ));
          })}

          {/* Labels */}
          {showLabels && data.map((item, index) => (
            <text
              key={index}
              x={getX(index)}
              y={height - 10}
              textAnchor="middle"
              className="text-xs fill-gray-600"
            >
              {item.name || item.date || index + 1}
            </text>
          ))}
        </svg>
      </div>
    );
  }

  // Line chart
  return (
    <div className={`${className}`}>
      <svg width={chartWidth} height={height} className="w-full">
        {/* Grid lines */}
        {showGrid && (
          <g>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
              <line
                key={i}
                x1={padding}
                y1={padding + ratio * chartHeight}
                x2={chartWidth - padding}
                y2={padding + ratio * chartHeight}
                stroke="#E5E7EB"
                strokeWidth="1"
              />
            ))}
          </g>
        )}

        {/* Lines */}
        {numericKeys.map((key, keyIndex) => {
          const points = data.map((item, index) => 
            `${getX(index)},${getY(item[key])}`
          ).join(' ');

          return (
            <g key={key}>
              <polyline
                points={points}
                fill="none"
                stroke={colors[keyIndex % colors.length]}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="hover:stroke-opacity-80 transition-all"
              />
              {/* Data points */}
              {data.map((item, index) => (
                <circle
                  key={index}
                  cx={getX(index)}
                  cy={getY(item[key])}
                  r="4"
                  fill={colors[keyIndex % colors.length]}
                  className="hover:r-6 transition-all"
                />
              ))}
            </g>
          );
        })}

        {/* Labels */}
        {showLabels && data.map((item, index) => (
          <text
            key={index}
            x={getX(index)}
            y={height - 10}
            textAnchor="middle"
            className="text-xs fill-gray-600"
          >
            {item.name || item.date || index + 1}
          </text>
        ))}
      </svg>
    </div>
  );
};

export default SimpleChart;