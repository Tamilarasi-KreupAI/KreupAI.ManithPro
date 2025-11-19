import React, { useEffect, useState } from 'react';
import { websocketService, PresenceStatus } from '../utils/websocketService';

interface PresenceIndicatorProps {
  userId: string;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  userId,
  showLabel = false,
  size = 'md',
}) => {
  const [status, setStatus] = useState<'online' | 'away' | 'offline'>('offline');
  const [lastSeen, setLastSeen] = useState<Date | null>(null);

  useEffect(() => {
    // Subscribe to presence updates
    const unsubscribe = websocketService.on('presence', (data: PresenceStatus) => {
      if (data.userId === userId) {
        setStatus(data.status);
        if (data.lastSeen) {
          setLastSeen(data.lastSeen);
        }
      }
    });

    // Request initial presence status
    websocketService.send('presence', { action: 'query', userId });

    return unsubscribe;
  }, [userId]);

  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'bg-green-500',
          label: 'Online',
          ring: 'ring-green-300',
        };
      case 'away':
        return {
          color: 'bg-yellow-500',
          label: 'Away',
          ring: 'ring-yellow-300',
        };
      case 'offline':
        return {
          color: 'bg-gray-400',
          label: 'Offline',
          ring: 'ring-gray-300',
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-2 h-2';
      case 'lg':
        return 'w-4 h-4';
      case 'md':
      default:
        return 'w-3 h-3';
    }
  };

  const getLastSeenText = () => {
    if (!lastSeen || status === 'online') return null;

    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return lastSeen.toLocaleDateString();
  };

  const config = getStatusConfig();

  return (
    <div className="inline-flex items-center gap-2">
      <div className="relative">
        <div
          className={`${getSizeClasses()} ${config.color} rounded-full ${
            status === 'online' ? 'animate-pulse' : ''
          }`}
          title={config.label}
        />
        {status === 'online' && (
          <div className={`absolute inset-0 ${config.color} rounded-full animate-ping opacity-75`} />
        )}
      </div>
      {showLabel && (
        <span className="text-xs text-gray-600 dark:text-gray-400">
          {config.label}
          {status === 'offline' && lastSeen && ` · ${getLastSeenText()}`}
        </span>
      )}
    </div>
  );
};

export default PresenceIndicator;
