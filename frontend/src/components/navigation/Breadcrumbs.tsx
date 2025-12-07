// ============================================================
// BREADCRUMBS - Navigation breadcrumb trail component
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ReactNode;
}

export interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  separator?: React.ReactNode;
  homeIcon?: React.ReactNode;
  showHome?: boolean;
  homeHref?: string;
  homeLabel?: string;
  maxItems?: number;
  className?: string;
  itemClassName?: string;
  activeClassName?: string;
  'aria-label'?: string;
}

// ============================================
// Default Separator
// ============================================
const DefaultSeparator: React.FC = () => (
  <svg
    className="w-4 h-4 text-gray-400 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

// ============================================
// Default Home Icon
// ============================================
const DefaultHomeIcon: React.FC = () => (
  <svg
    className="w-4 h-4 flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
    />
  </svg>
);

// ============================================
// Breadcrumbs Component
// ============================================
export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items = [],
  separator,
  homeIcon,
  showHome = true,
  homeHref = '/',
  homeLabel = 'Home',
  maxItems = 4,
  className,
  itemClassName,
  activeClassName,
  'aria-label': ariaLabel = 'Breadcrumb',
}) => {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: homeLabel, href: homeHref, icon: homeIcon || <DefaultHomeIcon /> }, ...items]
    : items;

  // Collapse middle items if too many
  const shouldCollapse = allItems.length > maxItems;
  let displayItems = allItems;

  if (shouldCollapse) {
    const firstItems = allItems.slice(0, 1);
    const lastItems = allItems.slice(-2);
    displayItems = [
      ...firstItems,
      { label: '...', href: undefined },
      ...lastItems,
    ];
  }

  return (
    <nav aria-label={ariaLabel} className={className}>
      <ol className="flex items-center flex-wrap gap-1 sm:gap-2" role="list">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCollapsed = item.label === '...';

          return (
            <li key={index} className="flex items-center gap-1 sm:gap-2">
              {index > 0 && (
                <span className="flex-shrink-0" aria-hidden="true">
                  {separator || <DefaultSeparator />}
                </span>
              )}

              {isCollapsed ? (
                <span className="text-gray-400 text-sm px-1">...</span>
              ) : isLast || !item.href ? (
                <span
                  className={cn(
                    'text-sm font-medium truncate max-w-[200px]',
                    isLast ? 'text-gray-900' : 'text-gray-500',
                    isLast && activeClassName
                  )}
                  aria-current={isLast ? 'page' : undefined}
                >
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </span>
              ) : (
                <Link
                  to={item.href}
                  className={cn(
                    'text-sm text-gray-500 hover:text-gray-700 transition-colors',
                    'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded',
                    'truncate max-w-[200px]',
                    itemClassName
                  )}
                >
                  <span className="flex items-center gap-1.5">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ============================================
// Auto Breadcrumbs (from route)
// ============================================
export interface AutoBreadcrumbsProps extends Omit<BreadcrumbsProps, 'items'> {
  routeLabels?: Record<string, string>;
  excludeRoutes?: string[];
}

export const AutoBreadcrumbs: React.FC<AutoBreadcrumbsProps> = ({
  routeLabels = {},
  excludeRoutes = [],
  ...props
}) => {
  const location = useLocation();

  const pathnames = location.pathname
    .split('/')
    .filter((x) => x && !excludeRoutes.includes(x));

  const items: BreadcrumbItem[] = pathnames.map((segment, index) => {
    const href = `/${pathnames.slice(0, index + 1).join('/')}`;
    const label = routeLabels[segment] || formatSegment(segment);

    return {
      label,
      href: index === pathnames.length - 1 ? undefined : href,
    };
  });

  return <Breadcrumbs items={items} {...props} />;
};

// ============================================
// Helper Functions
// ============================================
function formatSegment(segment: string): string {
  // Handle UUIDs or IDs
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return 'Details';
  }
  if (/^\d+$/.test(segment)) {
    return `#${segment}`;
  }

  // Convert kebab-case or snake_case to Title Case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

// ============================================
// Breadcrumb Container
// ============================================
export interface BreadcrumbContainerProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  actions?: React.ReactNode;
}

export const BreadcrumbContainer: React.FC<BreadcrumbContainerProps> = ({
  children,
  className,
  title,
  actions,
}) => {
  return (
    <div className={cn('mb-4 sm:mb-6', className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0">
          {children}
          {title && (
            <h1 className="mt-2 text-xl sm:text-2xl font-bold text-gray-900 truncate">
              {title}
            </h1>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};
