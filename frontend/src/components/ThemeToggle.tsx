import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle: React.FC<{ className?: string }> = ({ className = '' }) => {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'light', label: 'Light', icon: '☀️' },
    { value: 'dark', label: 'Dark', icon: '🌙' },
    { value: 'system', label: 'System', icon: '💻' },
  ] as const;

  return (
    <div className={`flex items-center gap-1 ${className}`} role="radiogroup" aria-label="Theme selection">
      {themes.map(({ value, label, icon }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className={`
            px-3 py-2 rounded-lg text-sm font-medium transition-all
            ${
              theme === value
                ? 'bg-primary-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }
          `}
          role="radio"
          aria-checked={theme === value}
          aria-label={`${label} theme`}
          title={`Switch to ${label.toLowerCase()} theme`}
        >
          <span className="mr-1" aria-hidden="true">{icon}</span>
          <span className="hidden sm:inline">{label}</span>
        </button>
      ))}
    </div>
  );
};

export default ThemeToggle;
