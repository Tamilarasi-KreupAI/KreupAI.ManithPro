import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import NotificationDropdown from './NotificationDropdown';

const Navbar: React.FC = () => {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  const closeMobileMenu = () => setMobileMenuOpen(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isHome = location.pathname === '/';

  // Dynamic classes based on scroll and page
  const navClasses = `fixed w-full z-50 transition-all duration-300 ${scrolled || !isHome
      ? 'bg-white/80 backdrop-blur-md shadow-sm border-b border-blue-100 py-2'
      : 'bg-transparent py-4'
    }`;

  const linkClasses = `font-medium transition-colors ${scrolled || !isHome ? 'text-slate-600 hover:text-blue-600' : 'text-slate-800 hover:text-blue-600'
    }`;

  return (
    <nav className={navClasses}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20 group-hover:scale-105 transition-transform">
              M
            </div>
            <span className={`text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600`}>
              ManithPro
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {user ? (
              <>
                <Link to="/dashboard" className={linkClasses}>
                  Dashboard
                </Link>
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
                    <Link to="/recruiter/dashboard" className={linkClasses}>
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
                <Link to="/profile" className="flex items-center gap-2 pl-4 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm ring-2 ring-white">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                </Link>
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
            className="lg:hidden p-2 rounded-md text-slate-600 hover:bg-slate-100 focus:outline-none"
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
        <div className="lg:hidden bg-white border-t border-slate-100 shadow-xl absolute w-full">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 text-slate-600 font-medium"
                >
                  Dashboard
                </Link>
                {/* Add other mobile links as needed */}
                <Link
                  to="/profile"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 text-slate-600 font-medium"
                >
                  Profile
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={closeMobileMenu}
                  className="block py-3 px-4 rounded-lg hover:bg-blue-50 text-slate-600 font-medium"
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
