import React from 'react';

interface DataPoint {
  label: string;
  value: number;
}

interface SimpleLineChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  color?: string;
  fillArea?: boolean;
}

const SimpleLineChart: React.FC<SimpleLineChartProps> = ({
  data,
  title,
  height = 300,
  color = '#3b82f6',
  fillArea = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value), 1);
  const minValue = Math.min(...data.map(d => d.value), 0);
  const range = maxValue - minValue;

  const chartWidth = 100;
  const chartHeight = height - 60; // Reserve space for labels

  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight;
  };

  const getX = (index: number) => {
    return (index / (data.length - 1)) * chartWidth;
  };

  // Generate path for line
  const linePath = data.map((point, index) => {
    const x = getX(index);
    const y = getY(point.value);
    return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
  }).join(' ');

  // Generate path for area fill
  const areaPath = fillArea
    ? `${linePath} L ${chartWidth} ${chartHeight} L 0 ${chartHeight} Z`
    : '';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>
      )}

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Chart area */}
        <div className="absolute left-14 right-0 top-0 bottom-12">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full h-full"
            preserveAspectRatio="none"
          >
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((fraction, i) => (
              <line
                key={i}
                x1="0"
                y1={chartHeight * (1 - fraction)}
                x2={chartWidth}
                y2={chartHeight * (1 - fraction)}
                stroke="currentColor"
                className="text-gray-200 dark:text-gray-700"
                strokeWidth="0.5"
                strokeDasharray="2,2"
              />
            ))}

            {/* Area fill */}
            {fillArea && (
              <path
                d={areaPath}
                fill={color}
                opacity="0.1"
              />
            )}

            {/* Line */}
            <path
              d={linePath}
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {data.map((point, index) => (
              <g key={index}>
                <circle
                  cx={getX(index)}
                  cy={getY(point.value)}
                  r="3"
                  fill={color}
                  className="cursor-pointer hover:r-5 transition-all"
                >
                  <title>{`${point.label}: ${point.value}`}</title>
                </circle>
              </g>
            ))}
          </svg>
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 h-12 flex justify-between">
          {data.filter((_, i) => i === 0 || i === data.length - 1 || i === Math.floor(data.length / 2)).map((item, index) => (
            <div
              key={index}
              className="text-xs text-gray-600 dark:text-gray-400 text-center"
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleLineChart;
