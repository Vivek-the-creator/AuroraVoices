import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = ({
  user,
  onLogout,
  onToggleSidebar,
  onToggleNotifications,
  hasUnreadNotifications,
  searchQuery,
  setSearchQuery,
  suggestions = [],
  onSelectSuggestion,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);

  // mobile top visibility & profile open state
  const [showMobileTop, setShowMobileTop] = useState(true);
  const lastScrollY = useRef(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const isHome = location.pathname === '/';

  useEffect(() => {
    // reset when route changes
    setShowMobileTop(true);
    setIsProfileOpen(false);
    lastScrollY.current = window.scrollY || 0;
  }, [location.pathname]);

  useEffect(() => {
    if (!isHome) return;

    const handleScroll = () => {
      const currentY = window.scrollY || 0;
      if (currentY == 0) {
        setShowMobileTop(true);
      } else if(currentY > lastScrollY.current){
        setShowMobileTop(false);
      }
      lastScrollY.current = currentY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isHome]);

  const handleClearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleSelectSuggestion = (value) => {
    if (onSelectSuggestion) {
      onSelectSuggestion(value);
    } else {
      setSearchQuery(value);
    }
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const handleProfileClick = () => {
    setIsProfileOpen(true);
    if (onToggleSidebar) {
      onToggleSidebar();
    }
    setShowMobileTop(false);
  };

  const isMobile =
    typeof window !== 'undefined' && window.innerWidth <= 768;

  return (
    <>
      {/* Desktop / tablet original navbar (unchanged layout) */}
  {!isMobile && (
      <nav className="navbar aurora-navbar">
        <div className="container nav-content">
          <div className="nav-leading">
            <button
              className="profile-btn"
              onClick={handleProfileClick}
              aria-label="Profile"
            >
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '999px',
                    objectFit: 'cover',
                  }}
                />
              ) : (
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="3"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.5 18c1.6-2.5 4-3.5 5.5-3.5S16.9 15.5 18.5 18"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
            {user && (
              <button
                type="button"
                className="nav-bell-btn"
                onClick={onToggleNotifications}
                aria-label="Notifications"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3C9.79086 3 8 4.79086 8 7V8.09807C8 8.93054 7.74289 9.74296 7.26303 10.4235L6.10557 12.0741C5.39286 13.1039 6.12938 14.5 7.37707 14.5H16.6229C17.8706 14.5 18.6071 13.1039 17.8944 12.0741L16.737 10.4235C16.2571 9.74296 16 8.93054 16 8.09807V7C16 4.79086 14.2091 3 12 3Z"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 16C10.2706 17.1652 11.3065 18 12.5 18C13.6935 18 14.7294 17.1652 15 16"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {hasUnreadNotifications && <span className="nav-bell-dot" />}
              </button>
            )}
          </div>
          <div className="nav-search">
            <div className="nav-search-wrapper">
              <input
                ref={inputRef}
                type="text"
                placeholder="Search by title, author, username, or genre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
              />
              {isSearchFocused && searchQuery && (
                <button
                  type="button"
                  className="search-clear-btn"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
              {isSearchFocused && suggestions.length > 0 && (
                <div className="search-suggestions">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="search-suggestion-item"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleSelectSuggestion(s);
                      }}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="nav-links">
            <Link to="/" className="nav-link">
              Home
            </Link>
            <Link to="/add" className="nav-link">
              Add Post
            </Link>
            {user ? (
              <>
                <span className="nav-user">Hi, {user.name}</span>
                <div className="nav-icons">
                  <button
                    className="btn btn-danger"
                    onClick={onLogout}
                  >
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <button
                  className="btn btn-secondary"
                  onClick={() => navigate('/login')}
                >
                  Login
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate('/register')}
                >
                  Register
                </button>
              </>
            )}
          </div>
        </div>
      </nav>
)}

      {/* MOBILE: TOP NAVBAR */}
      {isMobile && isHome && showMobileTop && !isProfileOpen && (
        <div className="mobile-top-nav">
          {user ? (
            <>
              <div className="mobile-top-search-wrapper">
                <input
                  type="text"
                  placeholder="Search by title, author, username, or genre..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <button
                type="button"
                className="mobile-top-bell-btn"
                onClick={onToggleNotifications}
                aria-label="Notifications"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 3C9.79086 3 8 4.79086 8 7V8.09807C8 8.93054 7.74289 9.74296 7.26303 10.4235L6.10557 12.0741C5.39286 13.1039 6.12938 14.5 7.37707 14.5H16.6229C17.8706 14.5 18.6071 13.1039 17.8944 12.0741L16.737 10.4235C16.2571 9.74296 16 8.93054 16 8.09807V7C16 4.79086 14.2091 3 12 3Z"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 16C10.2706 17.1652 11.3065 18 12.5 18C13.6935 18 14.7294 17.1652 15 16"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {hasUnreadNotifications && <span className="nav-bell-dot" />}
              </button>
            </>
          ) : (
            <div className="mobile-top-auth-actions">
              <button
                className="btn btn-secondary"
                onClick={() => navigate('/login')}
              >
                Login
              </button>
              <button
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Register
              </button>
            </div>
          )}
        </div>
      )}

      {/* MOBILE: BOTTOM NAVBAR (all pages) */}
      {isMobile && (
        <div className="mobile-bottom-nav">
          {/* Home */}
          <button
            type="button"
            className="mobile-bottom-item"
            onClick={() => navigate('/')}
            aria-label="Home"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4 10L12 3L20 10V19C20 19.5523 19.5523 20 19 20H5C4.44772 20 4 19.5523 4 19V10Z"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 20V14H14V20"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          {/* Add post */}
          <button
            type="button"
            className="mobile-bottom-item"
            onClick={() => navigate('/add')}
            aria-label="Add Post"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="12"
                cy="12"
                r="8"
                stroke="#ffffff"
                strokeWidth="1.5"
              />
              <path
                d="M12 9V15"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M9 12H15"
                stroke="#ffffff"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {/* Profile */}
          <button
            type="button"
            className="mobile-bottom-item"
            onClick={handleProfileClick}
            aria-label="Profile"
          >
            <div className="mobile-bottom-profile-btn">
              {user?.avatar ? (
                <img src={user.avatar} alt="Profile" />
              ) : (
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="12"
                    cy="9"
                    r="3"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M6.5 18c1.6-2.5 4-3.5 5.5-3.5S16.9 15.5 18.5 18"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </div>
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;
