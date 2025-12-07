import { ReactNode } from 'react';
import {
  Inbox,
  Search,
  FileX,
  FolderOpen,
  AlertCircle,
  WifiOff,
  Lock,
  Users,
  ShoppingCart,
  Calendar,
  MessageSquare,
  Bell,
  Settings,
  Heart,
  Bookmark,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button, type ButtonProps } from './Button';

export interface EmptyStateProps {
  icon?: ReactNode | LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: ButtonProps['variant'];
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'card' | 'centered';
  className?: string;
  children?: ReactNode;
}

function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  size = 'md',
  variant = 'default',
  className,
  children,
}: EmptyStateProps) {
  const sizes = {
    sm: {
      icon: 'h-10 w-10',
      iconContainer: 'h-16 w-16',
      title: 'text-base',
      description: 'text-sm',
      gap: 'gap-3',
      padding: 'p-6',
    },
    md: {
      icon: 'h-12 w-12',
      iconContainer: 'h-20 w-20',
      title: 'text-lg',
      description: 'text-sm',
      gap: 'gap-4',
      padding: 'p-8',
    },
    lg: {
      icon: 'h-16 w-16',
      iconContainer: 'h-24 w-24',
      title: 'text-xl',
      description: 'text-base',
      gap: 'gap-5',
      padding: 'p-12',
    },
  };

  const sizeConfig = sizes[size];

  // Render icon (can be a component or ReactNode)
  const renderIcon = () => {
    if (!Icon) return null;

    // Check if it's a Lucide icon component
    if (typeof Icon === 'function') {
      const LucideIcon = Icon as LucideIcon;
      return (
        <LucideIcon
          className={cn(sizeConfig.icon, 'text-gray-400 dark:text-gray-500')}
          strokeWidth={1.5}
        />
      );
    }

    // Otherwise it's a ReactNode
    return Icon;
  };

  return (
    <div
      className={cn(
        'flex flex-col items-center text-center',
        sizeConfig.gap,
        variant === 'card' &&
          'bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800',
        variant === 'card' && sizeConfig.padding,
        variant === 'centered' && 'justify-center min-h-[400px]',
        className
      )}
    >
      {Icon && (
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800',
            sizeConfig.iconContainer
          )}
        >
          {renderIcon()}
        </div>
      )}

      <div className="space-y-2">
        <h3
          className={cn(
            'font-semibold text-gray-900 dark:text-gray-100',
            sizeConfig.title
          )}
        >
          {title}
        </h3>
        {description && (
          <p
            className={cn(
              'text-gray-500 dark:text-gray-400 max-w-sm mx-auto',
              sizeConfig.description
            )}
          >
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction || children) && (
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button variant="ghost" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// ============================================================
// PRESET EMPTY STATES
// ============================================================

// No Results (Search)
export interface NoResultsProps {
  query?: string;
  onClear?: () => void;
  className?: string;
}

function NoResults({ query, onClear, className }: NoResultsProps) {
  return (
    <EmptyState
      icon={Search}
      title={query ? `No results for "${query}"` : 'No results found'}
      description="Try adjusting your search or filter criteria to find what you're looking for."
      action={onClear ? { label: 'Clear Search', onClick: onClear } : undefined}
      className={className}
    />
  );
}

// No Data
export interface NoDataProps {
  entityName?: string;
  onCreate?: () => void;
  className?: string;
}

function NoData({ entityName = 'items', onCreate, className }: NoDataProps) {
  return (
    <EmptyState
      icon={Inbox}
      title={`No ${entityName} yet`}
      description={`Get started by creating your first ${entityName.slice(0, -1) || 'item'}.`}
      action={onCreate ? { label: `Create ${entityName.slice(0, -1) || 'Item'}`, onClick: onCreate } : undefined}
      className={className}
    />
  );
}

// Error State
export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

function ErrorState({
  title = 'Something went wrong',
  message = "We couldn't load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <EmptyState
      icon={AlertCircle}
      title={title}
      description={message}
      action={onRetry ? { label: 'Try Again', onClick: onRetry, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

// Offline State
export interface OfflineStateProps {
  onRetry?: () => void;
  className?: string;
}

function OfflineState({ onRetry, className }: OfflineStateProps) {
  return (
    <EmptyState
      icon={WifiOff}
      title="You're offline"
      description="Check your internet connection and try again."
      action={onRetry ? { label: 'Retry', onClick: onRetry, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

// Access Denied
export interface AccessDeniedProps {
  onGoBack?: () => void;
  className?: string;
}

function AccessDenied({ onGoBack, className }: AccessDeniedProps) {
  return (
    <EmptyState
      icon={Lock}
      title="Access Denied"
      description="You don't have permission to view this content."
      action={onGoBack ? { label: 'Go Back', onClick: onGoBack, variant: 'outline' } : undefined}
      className={className}
    />
  );
}

// Not Found
export interface NotFoundProps {
  onGoHome?: () => void;
  className?: string;
}

function NotFound({ onGoHome, className }: NotFoundProps) {
  return (
    <EmptyState
      icon={FileX}
      title="Page Not Found"
      description="The page you're looking for doesn't exist or has been moved."
      action={onGoHome ? { label: 'Go Home', onClick: onGoHome } : undefined}
      className={className}
    />
  );
}

// Empty Folder
export interface EmptyFolderProps {
  folderName?: string;
  onUpload?: () => void;
  className?: string;
}

function EmptyFolder({ folderName, onUpload, className }: EmptyFolderProps) {
  return (
    <EmptyState
      icon={FolderOpen}
      title={folderName ? `${folderName} is empty` : 'This folder is empty'}
      description="Upload files or create new documents to get started."
      action={onUpload ? { label: 'Upload Files', onClick: onUpload } : undefined}
      className={className}
    />
  );
}

// Empty Cart
export interface EmptyCartProps {
  onBrowse?: () => void;
  className?: string;
}

function EmptyCart({ onBrowse, className }: EmptyCartProps) {
  return (
    <EmptyState
      icon={ShoppingCart}
      title="Your cart is empty"
      description="Start shopping to add items to your cart."
      action={onBrowse ? { label: 'Browse Products', onClick: onBrowse } : undefined}
      className={className}
    />
  );
}

// No Events
export interface NoEventsProps {
  onCreate?: () => void;
  className?: string;
}

function NoEvents({ onCreate, className }: NoEventsProps) {
  return (
    <EmptyState
      icon={Calendar}
      title="No events scheduled"
      description="Create an event to get started with your calendar."
      action={onCreate ? { label: 'Create Event', onClick: onCreate } : undefined}
      className={className}
    />
  );
}

// No Messages
export interface NoMessagesProps {
  onCompose?: () => void;
  className?: string;
}

function NoMessages({ onCompose, className }: NoMessagesProps) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No messages"
      description="Start a conversation to see your messages here."
      action={onCompose ? { label: 'New Message', onClick: onCompose } : undefined}
      className={className}
    />
  );
}

// No Notifications
export interface NoNotificationsProps {
  className?: string;
}

function NoNotifications({ className }: NoNotificationsProps) {
  return (
    <EmptyState
      icon={Bell}
      title="No notifications"
      description="You're all caught up! Check back later for updates."
      size="sm"
      className={className}
    />
  );
}

// No Team Members
export interface NoTeamMembersProps {
  onInvite?: () => void;
  className?: string;
}

function NoTeamMembers({ onInvite, className }: NoTeamMembersProps) {
  return (
    <EmptyState
      icon={Users}
      title="No team members"
      description="Invite team members to collaborate on this project."
      action={onInvite ? { label: 'Invite Members', onClick: onInvite } : undefined}
      className={className}
    />
  );
}

// Coming Soon
export interface ComingSoonProps {
  feature?: string;
  className?: string;
}

function ComingSoon({ feature, className }: ComingSoonProps) {
  return (
    <EmptyState
      icon={Settings}
      title="Coming Soon"
      description={
        feature
          ? `${feature} is currently under development. Stay tuned!`
          : 'This feature is currently under development. Stay tuned!'
      }
      className={className}
    />
  );
}

// No Favorites
export interface NoFavoritesProps {
  onBrowse?: () => void;
  className?: string;
}

function NoFavorites({ onBrowse, className }: NoFavoritesProps) {
  return (
    <EmptyState
      icon={Heart}
      title="No favorites yet"
      description="Items you favorite will appear here for quick access."
      action={onBrowse ? { label: 'Browse Items', onClick: onBrowse } : undefined}
      className={className}
    />
  );
}

// No Bookmarks
export interface NoBookmarksProps {
  className?: string;
}

function NoBookmarks({ className }: NoBookmarksProps) {
  return (
    <EmptyState
      icon={Bookmark}
      title="No bookmarks"
      description="Save items you want to revisit later."
      size="sm"
      className={className}
    />
  );
}

export {
  EmptyState,
  NoResults,
  NoData,
  ErrorState,
  OfflineState,
  AccessDenied,
  NotFound,
  EmptyFolder,
  EmptyCart,
  NoEvents,
  NoMessages,
  NoNotifications,
  NoTeamMembers,
  ComingSoon,
  NoFavorites,
  NoBookmarks,
};
