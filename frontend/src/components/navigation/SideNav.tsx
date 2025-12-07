// ============================================================
// SIDENAV - Collapsible sidebar navigation component
// ============================================================

import React, { useState, createContext, useContext, useCallback } from 'react';
import { Link, useLocation, matchPath } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface NavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  badgeColor?: 'default' | 'success' | 'warning' | 'error';
  children?: NavItem[];
  disabled?: boolean;
  external?: boolean;
  onClick?: () => void;
}

export interface NavSection {
  id: string;
  title?: string;
  items: NavItem[];
  collapsible?: boolean;
}

export interface SideNavProps {
  sections: NavSection[];
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  width?: number;
  collapsedWidth?: number;
}

// ============================================
// Context
// ============================================
interface SideNavContextValue {
  collapsed: boolean;
  activeHref: string;
}

const SideNavContext = createContext<SideNavContextValue>({
  collapsed: false,
  activeHref: '',
});

// ============================================
// Badge Component
// ============================================
interface BadgeProps {
  value: string | number;
  color?: 'default' | 'success' | 'warning' | 'error';
  collapsed?: boolean;
}

const Badge: React.FC<BadgeProps> = ({ value, color = 'default', collapsed }) => {
  const colorClasses = {
    default: 'bg-gray-100 text-gray-600',
    success: 'bg-green-100 text-green-600',
    warning: 'bg-yellow-100 text-yellow-600',
    error: 'bg-red-100 text-red-600',
  };

  if (collapsed) {
    return (
      <span
        className={cn(
          'absolute top-0 right-0 w-2 h-2 rounded-full',
          color === 'default' ? 'bg-gray-400' :
          color === 'success' ? 'bg-green-500' :
          color === 'warning' ? 'bg-yellow-500' :
          'bg-red-500'
        )}
      />
    );
  }

  return (
    <span
      className={cn(
        'ml-auto text-xs font-medium px-2 py-0.5 rounded-full',
        colorClasses[color]
      )}
    >
      {value}
    </span>
  );
};

// ============================================
// Nav Item Component
// ============================================
interface NavItemComponentProps {
  item: NavItem;
  depth?: number;
}

const NavItemComponent: React.FC<NavItemComponentProps> = ({
  item,
  depth = 0,
}) => {
  const { collapsed, activeHref } = useContext(SideNavContext);
  const [expanded, setExpanded] = useState(false);
  const location = useLocation();

  const isActive = item.href
    ? matchPath({ path: item.href, end: item.href === '/' }, location.pathname) !== null
    : false;

  const hasChildren = item.children && item.children.length > 0;

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }

    if (hasChildren && !item.href) {
      e.preventDefault();
      setExpanded(!expanded);
    }

    item.onClick?.();
  }, [item, hasChildren, expanded]);

  const content = (
    <>
      <span className="relative flex-shrink-0">
        {item.icon}
        {collapsed && item.badge && (
          <Badge value={item.badge} color={item.badgeColor} collapsed />
        )}
      </span>

      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>

          {item.badge && (
            <Badge value={item.badge} color={item.badgeColor} />
          )}

          {hasChildren && (
            <svg
              className={cn(
                'w-4 h-4 transition-transform flex-shrink-0',
                expanded && 'rotate-90'
              )}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
        </>
      )}
    </>
  );

  const baseClasses = cn(
    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
    depth > 0 && !collapsed && 'ml-8',
    collapsed && 'justify-center px-2',
    item.disabled && 'opacity-50 cursor-not-allowed',
    isActive
      ? 'bg-indigo-50 text-indigo-700'
      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
  );

  if (item.external && item.href) {
    return (
      <a
        href={item.href}
        target="_blank"
        rel="noopener noreferrer"
        className={baseClasses}
        onClick={handleClick}
        title={collapsed ? item.label : undefined}
      >
        {content}
        {!collapsed && (
          <svg className="w-3 h-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        )}
      </a>
    );
  }

  if (item.href) {
    return (
      <>
        <Link
          to={item.href}
          className={baseClasses}
          onClick={handleClick}
          title={collapsed ? item.label : undefined}
          aria-current={isActive ? 'page' : undefined}
        >
          {content}
        </Link>
        {hasChildren && expanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => (
              <NavItemComponent key={child.id} item={child} depth={depth + 1} />
            ))}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn(baseClasses, 'w-full text-left')}
        onClick={handleClick}
        disabled={item.disabled}
        title={collapsed ? item.label : undefined}
      >
        {content}
      </button>
      {hasChildren && expanded && !collapsed && (
        <div className="mt-1 space-y-1">
          {item.children!.map((child) => (
            <NavItemComponent key={child.id} item={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </>
  );
};

// ============================================
// Nav Section Component
// ============================================
interface NavSectionComponentProps {
  section: NavSection;
}

const NavSectionComponent: React.FC<NavSectionComponentProps> = ({ section }) => {
  const { collapsed } = useContext(SideNavContext);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="py-2">
      {section.title && !collapsed && (
        <div className="px-3 mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            {section.title}
          </span>
          {section.collapsible && (
            <button
              type="button"
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="p-0.5 rounded hover:bg-gray-100"
            >
              <svg
                className={cn(
                  'w-3 h-3 text-gray-400 transition-transform',
                  isCollapsed && '-rotate-90'
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          )}
        </div>
      )}

      {!isCollapsed && (
        <nav className="space-y-1">
          {section.items.map((item) => (
            <NavItemComponent key={item.id} item={item} />
          ))}
        </nav>
      )}
    </div>
  );
};

// ============================================
// SideNav Component
// ============================================
export const SideNav: React.FC<SideNavProps> = ({
  sections,
  collapsed = false,
  onToggleCollapse,
  header,
  footer,
  className,
  width = 256,
  collapsedWidth = 64,
}) => {
  const location = useLocation();

  return (
    <SideNavContext.Provider value={{ collapsed, activeHref: location.pathname }}>
      <aside
        className={cn(
          'h-full flex flex-col bg-white border-r border-gray-200 transition-all duration-300',
          className
        )}
        style={{ width: collapsed ? collapsedWidth : width }}
      >
        {/* Header */}
        {header && (
          <div className={cn('flex-shrink-0 border-b border-gray-200', collapsed ? 'p-2' : 'p-4')}>
            {header}
          </div>
        )}

        {/* Collapse Toggle */}
        {onToggleCollapse && (
          <div className={cn('flex-shrink-0 border-b border-gray-200', collapsed ? 'p-2' : 'px-3 py-2')}>
            <button
              type="button"
              onClick={onToggleCollapse}
              className={cn(
                'flex items-center gap-2 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors',
                collapsed && 'w-full justify-center'
              )}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg
                className={cn('w-5 h-5 transition-transform', collapsed && 'rotate-180')}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              {!collapsed && <span className="text-sm font-medium">Collapse</span>}
            </button>
          </div>
        )}

        {/* Navigation Sections */}
        <div className="flex-1 overflow-y-auto px-2">
          {sections.map((section, index) => (
            <React.Fragment key={section.id}>
              {index > 0 && <div className="border-t border-gray-200 my-2" />}
              <NavSectionComponent section={section} />
            </React.Fragment>
          ))}
        </div>

        {/* Footer */}
        {footer && (
          <div className={cn('flex-shrink-0 border-t border-gray-200', collapsed ? 'p-2' : 'p-4')}>
            {footer}
          </div>
        )}
      </aside>
    </SideNavContext.Provider>
  );
};

// ============================================
// Mini SideNav (Icon-only)
// ============================================
export interface MiniSideNavProps {
  items: NavItem[];
  className?: string;
}

export const MiniSideNav: React.FC<MiniSideNavProps> = ({ items, className }) => {
  const location = useLocation();

  return (
    <aside className={cn('w-16 h-full bg-white border-r border-gray-200 py-4', className)}>
      <nav className="flex flex-col items-center space-y-2">
        {items.map((item) => {
          const isActive = item.href
            ? matchPath({ path: item.href, end: item.href === '/' }, location.pathname) !== null
            : false;

          return (
            <Link
              key={item.id}
              to={item.href || '#'}
              className={cn(
                'relative p-3 rounded-xl transition-colors',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500',
                isActive
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
              )}
              title={item.label}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {item.icon}
              {item.badge && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};
