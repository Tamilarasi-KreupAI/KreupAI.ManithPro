// ============================================================
// REAL-TIME COMPONENTS - UI components for real-time features
// ============================================================

import React, { useMemo } from 'react';
import { cn } from '../../utils/cn';
import type { PresenceStatus, UserPresence } from '../hooks/usePresence';
import type { TypingUser } from '../hooks/useTyping';

// ============================================
// Presence Indicator
// ============================================
export interface PresenceIndicatorProps {
  status: PresenceStatus;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

export const PresenceIndicator: React.FC<PresenceIndicatorProps> = ({
  status,
  size = 'sm',
  showLabel = false,
  className,
}) => {
  const sizeClasses = {
    xs: 'w-2 h-2',
    sm: 'w-2.5 h-2.5',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const statusClasses = {
    online: 'bg-green-500',
    offline: 'bg-gray-400',
    away: 'bg-yellow-500',
    busy: 'bg-red-500',
  };

  const statusLabels = {
    online: 'Online',
    offline: 'Offline',
    away: 'Away',
    busy: 'Busy',
  };

  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span
        className={cn(
          'rounded-full ring-2 ring-white',
          sizeClasses[size],
          statusClasses[status],
          status === 'online' && 'animate-pulse'
        )}
        aria-label={statusLabels[status]}
      />
      {showLabel && (
        <span className="text-xs text-gray-500">{statusLabels[status]}</span>
      )}
    </span>
  );
};

// ============================================
// Avatar with Presence
// ============================================
export interface AvatarWithPresenceProps {
  name: string;
  src?: string;
  status?: PresenceStatus;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AvatarWithPresence: React.FC<AvatarWithPresenceProps> = ({
  name,
  src,
  status,
  size = 'md',
  className,
}) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const indicatorPositions = {
    sm: '-bottom-0.5 -right-0.5',
    md: '-bottom-0.5 -right-0.5',
    lg: 'bottom-0 right-0',
    xl: 'bottom-0.5 right-0.5',
  };

  const indicatorSizes = {
    sm: 'xs',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
  } as const;

  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className={cn('relative inline-block', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full bg-indigo-100 flex items-center justify-center font-medium text-indigo-600',
            sizeClasses[size],
            size === 'sm' && 'text-xs',
            size === 'md' && 'text-sm',
            size === 'lg' && 'text-base',
            size === 'xl' && 'text-lg'
          )}
        >
          {initials}
        </div>
      )}
      {status && (
        <span className={cn('absolute', indicatorPositions[size])}>
          <PresenceIndicator status={status} size={indicatorSizes[size]} />
        </span>
      )}
    </div>
  );
};

// ============================================
// Online Users List
// ============================================
export interface OnlineUsersListProps {
  users: UserPresence[];
  maxVisible?: number;
  showStatus?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onUserClick?: (user: UserPresence) => void;
}

export const OnlineUsersList: React.FC<OnlineUsersListProps> = ({
  users,
  maxVisible = 5,
  showStatus = true,
  size = 'md',
  className,
  onUserClick,
}) => {
  const visibleUsers = users.slice(0, maxVisible);
  const remainingCount = Math.max(0, users.length - maxVisible);

  if (users.length === 0) {
    return (
      <div className={cn('text-sm text-gray-500', className)}>
        No users online
      </div>
    );
  }

  return (
    <div className={cn('flex items-center', className)}>
      <div className="flex -space-x-2">
        {visibleUsers.map((user) => (
          <button
            key={user.userId}
            type="button"
            onClick={() => onUserClick?.(user)}
            className="relative focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 rounded-full"
            title={`${user.userName} (${user.status})`}
          >
            <AvatarWithPresence
              name={user.userName}
              status={showStatus ? user.status : undefined}
              size={size}
            />
          </button>
        ))}
        {remainingCount > 0 && (
          <div
            className={cn(
              'flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium border-2 border-white',
              size === 'sm' && 'w-8 h-8 text-xs',
              size === 'md' && 'w-10 h-10 text-sm',
              size === 'lg' && 'w-12 h-12 text-base'
            )}
          >
            +{remainingCount}
          </div>
        )}
      </div>
      <span className="ml-3 text-sm text-gray-500">
        {users.length} online
      </span>
    </div>
  );
};

// ============================================
// Typing Indicator
// ============================================
export interface TypingIndicatorProps {
  typingUsers: TypingUser[];
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  typingUsers,
  className,
}) => {
  const text = useMemo(() => {
    const count = typingUsers.length;

    if (count === 0) return null;
    if (count === 1) return `${typingUsers[0].userName} is typing`;
    if (count === 2) {
      return `${typingUsers[0].userName} and ${typingUsers[1].userName} are typing`;
    }
    return `${typingUsers[0].userName} and ${count - 1} others are typing`;
  }, [typingUsers]);

  if (!text) return null;

  return (
    <div className={cn('flex items-center gap-2 text-sm text-gray-500', className)}>
      {/* Animated dots */}
      <span className="flex gap-0.5">
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{text}</span>
    </div>
  );
};

// ============================================
// Connection Status
// ============================================
export interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
  error?: Error | null;
  showText?: boolean;
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  isReconnecting = false,
  error,
  showText = true,
  className,
}) => {
  const getStatus = () => {
    if (error) return { color: 'red', text: 'Error', icon: '✕' };
    if (isReconnecting) return { color: 'yellow', text: 'Reconnecting...', icon: '↻' };
    if (isConnected) return { color: 'green', text: 'Connected', icon: '✓' };
    return { color: 'gray', text: 'Disconnected', icon: '○' };
  };

  const status = getStatus();

  const colorClasses = {
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    gray: 'bg-gray-400',
  };

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'w-2 h-2 rounded-full',
          colorClasses[status.color as keyof typeof colorClasses],
          isReconnecting && 'animate-pulse'
        )}
      />
      {showText && (
        <span className={cn(
          'text-xs font-medium',
          status.color === 'green' && 'text-green-600',
          status.color === 'yellow' && 'text-yellow-600',
          status.color === 'red' && 'text-red-600',
          status.color === 'gray' && 'text-gray-500'
        )}>
          {status.text}
        </span>
      )}
    </div>
  );
};

// ============================================
// Live Badge
// ============================================
export interface LiveBadgeProps {
  isLive?: boolean;
  pulseAnimation?: boolean;
  className?: string;
}

export const LiveBadge: React.FC<LiveBadgeProps> = ({
  isLive = true,
  pulseAnimation = true,
  className,
}) => {
  if (!isLive) return null;

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium',
        'bg-red-100 text-red-700',
        className
      )}
    >
      <span
        className={cn(
          'w-1.5 h-1.5 bg-red-500 rounded-full',
          pulseAnimation && 'animate-pulse'
        )}
      />
      LIVE
    </span>
  );
};

// ============================================
// Real-Time Counter
// ============================================
export interface RealTimeCounterProps {
  count: number;
  label?: string;
  animate?: boolean;
  className?: string;
}

export const RealTimeCounter: React.FC<RealTimeCounterProps> = ({
  count,
  label,
  animate = true,
  className,
}) => {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5',
          'bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium',
          'transition-all duration-200',
          animate && 'transform'
        )}
      >
        {count}
      </span>
      {label && <span className="text-sm text-gray-600">{label}</span>}
    </div>
  );
};

// ============================================
// Activity Feed Item
// ============================================
export interface ActivityFeedItemProps {
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: Date;
  isNew?: boolean;
  className?: string;
}

export const ActivityFeedItem: React.FC<ActivityFeedItemProps> = ({
  user,
  action,
  target,
  timestamp,
  isNew = false,
  className,
}) => {
  const formatTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg transition-colors',
        isNew && 'bg-indigo-50',
        className
      )}
    >
      <AvatarWithPresence name={user.name} src={user.avatar} size="sm" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          <span className="font-medium">{user.name}</span>
          {' '}{action}
          {target && (
            <>
              {' '}<span className="font-medium">{target}</span>
            </>
          )}
        </p>
        <p className="text-xs text-gray-500 mt-0.5">
          {formatTime(timestamp)}
        </p>
      </div>
      {isNew && (
        <span className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-2" />
      )}
    </div>
  );
};

// ============================================
// Notification Toast
// ============================================
export interface NotificationToastProps {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  onClose?: () => void;
  onClick?: () => void;
  className?: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  title,
  message,
  type = 'info',
  onClose,
  onClick,
  className,
}) => {
  const typeStyles = {
    info: 'border-blue-500 bg-blue-50',
    success: 'border-green-500 bg-green-50',
    warning: 'border-yellow-500 bg-yellow-50',
    error: 'border-red-500 bg-red-50',
  };

  const iconColors = {
    info: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    error: 'text-red-500',
  };

  return (
    <div
      className={cn(
        'w-full max-w-sm overflow-hidden rounded-lg border-l-4 shadow-lg',
        typeStyles[type],
        onClick && 'cursor-pointer hover:opacity-90',
        className
      )}
      onClick={onClick}
      role="alert"
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900">{title}</p>
            <p className="mt-1 text-sm text-gray-500 line-clamp-2">{message}</p>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="ml-4 inline-flex text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <span className="sr-only">Close</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
