import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);
  const closeProfileDropdown = () => setProfileDropdownOpen(false);

  const handleLogout = () => {
    logout();
    closeProfileDropdown();
    closeMobileMenu();
    navigate('/');
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileDropdownOpen && !(event.target as Element).closest('.profile-dropdown-container')) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [profileDropdownOpen]);

  // Close dropdown on route change
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [location.pathname]);

  // Hide navbar on B2B routes (B2B has its own sidebar layout) and auth pages
  // This check MUST be after all hooks to follow React's Rules of Hooks
  const authPages = ['/login', '/register', '/register/recruiter'];
  if (location.pathname.startsWith('/b2b') || authPages.includes(location.pathname)) {
    return null;
  }

  const isHome = location.pathname === '/';

  // Dynamic classes based on scroll and page
  const navClasses = `fixed w-full z-50 transition-all duration-300 ${scrolled || !isHome
      ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-blue-100 dark:border-gray-800 py-2'
      : 'bg-transparent py-4'
    }`;

  const linkClasses = `font-medium transition-colors ${scrolled || !isHome ? 'text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400' : 'text-slate-800 dark:text-white hover:text-blue-600 dark:hover:text-blue-400'
    }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <img
              src="/MANITHPRO.png"
              alt="ManithPro"
              className="h-20 w-auto group-hover:scale-105 transition-transform"
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {user ? (
              <>
                {user.role === 'CANDIDATE' ? (
                  <>
                    <Link to="/advanced-search" className={linkClasses}>
                      Search
                    </Link>
                    <Link to="/smart-recommendations" className={linkClasses}>
                      AI Match
                    </Link>
                    <Link to="/applications" className={linkClasses}>
                      Applications
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to={
                      user.role === 'CLIENT' ? '/admin/dashboard' :
                      user.role === 'VENDOR' ? '/b2b/dashboard' :
                      user.role === 'ADMIN' ?  '/admin/dashboard' :
                      '/recruiter/dashboard'
                    } className={linkClasses}>
                      Dashboard
                    </Link>

                    <Link to="/candidates" className={linkClasses}>
                      Candidates
                    </Link>
                  </>
                )}
                <Link to="/messages" className={linkClasses}>
                  Messages
                </Link>
                <NotificationDropdown />
                <div className="relative pl-4 border-l border-slate-200 profile-dropdown-container">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center gap-2 focus:outline-none"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm ring-2 ring-white dark:ring-gray-800">
                      {user.firstName?.charAt(0) || 'U'}
                    </div>
                    <svg className={`w-4 h-4 text-slate-500 dark:text-gray-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-slate-200 dark:border-gray-700 py-2 z-50">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-gray-700">
                        <p className="font-medium text-slate-800 dark:text-white">{user.firstName} {user.lastName}</p>
                        <p className="text-sm text-slate-500 dark:text-gray-400">{user.email}</p>
                      </div>
                      <Link
                        to="/profile"
                        onClick={closeProfileDropdown}
                        className="block px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                      >
                        <div className="flex items-center gap-3">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          View Profile
                        </div>
                      </Link>
                      {user.role === 'CANDIDATE' && (
                        <>
                          <Link
                            to="/profile/builder"
                            onClick={closeProfileDropdown}
                            className="block px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Profile Builder
                            </div>
                          </Link>
                          <Link
                            to="/profile/enhanced"
                            onClick={closeProfileDropdown}
                            className="block px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            <div className="flex items-center gap-3">
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                              </svg>
                              Enhanced Profile
                            </div>
                          </Link>
                        </>
                      )}
                      <div className="border-t border-slate-100 dark:border-gray-700 mt-2 pt-2">
                        <Link
                          to="/achievements"
                          onClick={closeProfileDropdown}
                          className="block px-4 py-2 text-slate-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Achievements
                          </div>
                        </Link>
                      </div>
                      <div className="border-t border-slate-100 dark:border-gray-700 mt-2 pt-2">
                        <button
                          onClick={handleLogout}
                          className="block w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                        >
                          <div className="flex items-center gap-3">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className={linkClasses}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-6 py-2.5 rounded-full font-medium transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-gray-800 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white dark:bg-gray-900 border-t border-slate-100 dark:border-gray-800 shadow-xl absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {user ? (
              <>
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 font-medium"
                >
                  Profile
                </Link>
                {user.role === 'CANDIDATE' && (
                  <>
                    <Link
                      to="/profile/builder"
                      onClick={closeMobileMenu}
                      className="block py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 font-medium"
                    >
                      Profile Builder
                    </Link>
                    <Link
                      to="/profile/enhanced"
                      onClick={closeMobileMenu}
                      className="block py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 font-medium"
                    >
                      Enhanced Profile
                    </Link>
                  </>
                )}
                <Link
                  to="/achievements"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 font-medium"
                >
                  Achievements
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-3 px-4 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 text-slate-600 dark:text-gray-300 font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg bg-blue-600 text-white font-medium text-center mt-4"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
