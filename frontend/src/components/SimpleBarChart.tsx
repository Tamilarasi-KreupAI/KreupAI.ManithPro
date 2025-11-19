import React from 'react';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  title?: string;
  height?: number;
  showValues?: boolean;
}

const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
  data,
  title,
  height = 300,
  showValues = true,
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(d => d.value));
  const barWidth = 100 / data.length;

  const getColor = (index: number, customColor?: string) => {
    if (customColor) return customColor;
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#8b5cf6', // purple
      '#f59e0b', // yellow
      '#ef4444', // red
      '#06b6d4', // cyan
    ];
    return colors[index % colors.length];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-gray-200 dark:border-gray-700 p-6">
      {title && (
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
          {title}
        </h3>
      )}

      <div className="relative" style={{ height }}>
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 w-12 flex flex-col justify-between text-xs text-gray-500 dark:text-gray-400">
          <span>{maxValue}</span>
          <span>{Math.round(maxValue * 0.75)}</span>
          <span>{Math.round(maxValue * 0.5)}</span>
          <span>{Math.round(maxValue * 0.25)}</span>
          <span>0</span>
        </div>

        {/* Bars */}
        <div className="absolute left-14 right-0 top-0 bottom-8 flex items-end gap-2">
          {data.map((item, index) => {
            const barHeight = maxValue > 0 ? (item.value / maxValue) * 100 : 0;
            const color = getColor(index, item.color);

            return (
              <div
                key={index}
                className="flex-1 flex flex-col items-center gap-2 group"
              >
                <div className="relative w-full flex items-end justify-center" style={{ height: '100%' }}>
                  {showValues && item.value > 0 && (
                    <div className="absolute -top-6 text-xs font-semibold text-gray-700 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.value}
                    </div>
                  )}
                  <div
                    className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80 cursor-pointer"
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: color,
                    }}
                    title={`${item.label}: ${item.value}`}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="absolute left-14 right-0 bottom-0 h-8 flex gap-2">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex-1 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400 text-center"
            >
              <span className="truncate">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SimpleBarChart;
