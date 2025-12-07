// ============================================================
// TOPNAV - Enhanced top navigation bar component
// ============================================================

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../../utils/cn';

// ============================================
// Types
// ============================================
export interface TopNavItem {
  id: string;
  label: string;
  href?: string;
  icon?: React.ReactNode;
  badge?: string | number;
  children?: TopNavItem[];
  onClick?: () => void;
}

export interface TopNavProps {
  logo?: React.ReactNode;
  logoHref?: string;
  items?: TopNavItem[];
  rightContent?: React.ReactNode;
  mobileMenuContent?: React.ReactNode;
  sticky?: boolean;
  transparent?: boolean;
  className?: string;
  onMobileMenuToggle?: (isOpen: boolean) => void;
}

// ============================================
// Dropdown Component
// ============================================
interface DropdownProps {
  trigger: React.ReactNode;
  items: TopNavItem[];
  align?: 'left' | 'right';
}

const Dropdown: React.FC<DropdownProps> = ({ trigger, items, align = 'left' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {trigger}
        <svg
          className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50',
            align === 'right' ? 'right-0' : 'left-0'
          )}
          role="menu"
        >
          {items.map((item) => (
            item.href ? (
              <Link
                key={item.id}
                to={item.href}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => setIsOpen(false)}
              >
                {item.icon}
                <span>{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-xs bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded">
                    {item.badge}
                  </span>
                )}
              </Link>
            ) : (
              <button
                key={item.id}
                type="button"
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                role="menuitem"
                onClick={() => {
                  item.onClick?.();
                  setIsOpen(false);
                }}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
};

// ============================================
// TopNav Component
// ============================================
export const TopNav: React.FC<TopNavProps> = ({
  logo,
  logoHref = '/',
  items = [],
  rightContent,
  mobileMenuContent,
  sticky = true,
  transparent = false,
  className,
  onMobileMenuToggle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMobileMenuToggle?.(newState);
  };

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <>
      <header
        className={cn(
          'w-full z-40 transition-all',
          sticky && 'sticky top-0',
          transparent ? 'bg-transparent' : 'bg-white border-b border-gray-200',
          className
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link
                to={logoHref}
                className="flex-shrink-0 flex items-center focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
              >
                {logo || (
                  <span className="text-xl font-bold text-indigo-600">Logo</span>
                )}
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-1">
              {items.map((item) => {
                if (item.children) {
                  return (
                    <Dropdown
                      key={item.id}
                      trigger={
                        <span className="flex items-center gap-1">
                          {item.icon}
                          {item.label}
                        </span>
                      }
                      items={item.children}
                    />
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.href || '#'}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      'focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500',
                      isActive(item.href || '')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    )}
                    aria-current={isActive(item.href || '') ? 'page' : undefined}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-1 text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* Right Content */}
            <div className="flex items-center gap-2">
              {rightContent}

              {/* Mobile Menu Button */}
              <button
                type="button"
                onClick={toggleMobileMenu}
                className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                aria-expanded={isMobileMenuOpen}
                aria-label="Toggle mobile menu"
              >
                <span className="sr-only">Open main menu</span>
                {isMobileMenuOpen ? (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-4 py-3 space-y-1">
              {items.map((item) => {
                if (item.children) {
                  return (
                    <div key={item.id} className="py-2">
                      <div className="text-xs font-semibold text-gray-400 uppercase px-3 mb-2">
                        {item.label}
                      </div>
                      <div className="space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.id}
                            to={child.href || '#'}
                            className={cn(
                              'flex items-center gap-2 px-3 py-2 text-sm rounded-md',
                              isActive(child.href || '')
                                ? 'bg-indigo-50 text-indigo-700'
                                : 'text-gray-600 hover:bg-gray-50'
                            )}
                            onClick={toggleMobileMenu}
                          >
                            {child.icon}
                            <span>{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.id}
                    to={item.href || '#'}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md',
                      isActive(item.href || '')
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    )}
                    onClick={toggleMobileMenu}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="ml-auto text-xs bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {mobileMenuContent && (
              <div className="border-t border-gray-200 px-4 py-3">
                {mobileMenuContent}
              </div>
            )}
          </div>
        )}
      </header>
    </>
  );
};

// ============================================
// Search Bar Component
// ============================================
export interface SearchBarProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = 'Search...',
  value = '',
  onChange,
  onSearch,
  className,
}) => {
  const [localValue, setLocalValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    onChange?.(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch?.(localValue);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
      <input
        type="search"
        value={localValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg',
          'text-sm text-gray-900 placeholder-gray-500',
          'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
          'bg-gray-50 hover:bg-gray-100 focus:bg-white transition-colors'
        )}
      />
      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
        <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-medium text-gray-400 bg-gray-100 border border-gray-200 rounded">
          <svg className="w-3 h-3 mr-0.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6.5 9V5.5a3 3 0 0 1 3-3h5a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-5a3 3 0 0 1-3-3V12" />
          </svg>
          K
        </kbd>
      </div>
    </div>
  );
};

// ============================================
// User Menu Component
// ============================================
export interface UserMenuProps {
  user: {
    name: string;
    email?: string;
    avatar?: string;
  };
  menuItems?: TopNavItem[];
  onLogout?: () => void;
}

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  menuItems = [],
  onLogout,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const allMenuItems: TopNavItem[] = [
    ...menuItems,
    ...(onLogout ? [{ id: 'logout', label: 'Sign out', onClick: onLogout }] : []),
  ];

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {user.avatar ? (
          <img
            src={user.avatar}
            alt={user.name}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center">
            <span className="text-sm font-medium text-indigo-600">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        <svg
          className={cn('w-4 h-4 text-gray-500 hidden sm:block transition-transform', isOpen && 'rotate-180')}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
          {/* User Info */}
          <div className="px-4 py-3 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            {user.email && (
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            )}
          </div>

          {/* Menu Items */}
          <div className="py-1">
            {allMenuItems.map((item, index) => {
              const isLast = index === allMenuItems.length - 1;
              const isLogout = item.id === 'logout';

              if (isLogout && menuItems.length > 0) {
                return (
                  <React.Fragment key={item.id}>
                    <div className="border-t border-gray-200 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        item.onClick?.();
                        setIsOpen(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      <span>{item.label}</span>
                    </button>
                  </React.Fragment>
                );
              }

              if (item.href) {
                return (
                  <Link
                    key={item.id}
                    to={item.href}
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </Link>
                );
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
