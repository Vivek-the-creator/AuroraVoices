import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const inputRef = useRef(null);

  /* SCROLL HIDE TOPBAR — MOBILE ONLY */
  useEffect(() => {
    let lastScroll = 0;
    const topbar = document.querySelector(".mobile-topbar");

    const onScroll = () => {
      if (!topbar) return;
      const current = window.scrollY;

      if (current > lastScroll) {
        topbar.style.transform = "translateY(-100%)"; // hide
      } else {
        topbar.style.transform = "translateY(0)"; // show
      }

      lastScroll = current;
    };

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Search handlers */
  const handleClearSearch = () => {
    setSearchQuery('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSelectSuggestion = (value) => {
    onSelectSuggestion ? onSelectSuggestion(value) : setSearchQuery(value);
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <>
      {/* ===========================
          MOBILE TOP BAR
      ============================ */}
      <div className="mobile-topbar">
        <div className="mobile-search-wrapper">
          <input
            type="text"
            placeholder="Search…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {user && (
          <button className="mobile-bell" onClick={onToggleNotifications}>
            <svg width="22" height="22" stroke="#fff" fill="none" viewBox="0 0 24 24">
              <path
                d="M12 3C9.8 3 8 4.8 8 7v1.1c0 .8-.3 1.6-.8 2.3L6 12.1c-.7 1 .0 2.4 1.3 2.4H16.7c1.3 0 2-1.4 1.3-2.4l-1.2-1.7c-.5-.7-.8-1.5-.8-2.3V7c0-2.2-1.8-4-4-4z"
                strokeWidth="1.5"
              />
            </svg>
            {hasUnreadNotifications && <span className="nav-bell-dot"></span>}
          </button>
        )}
      </div>

      {/* ===========================
          DESKTOP NAVBAR
      ============================ */}
      <nav className="navbar aurora-navbar">
        <div className="container nav-content">

          {/* LEFT — PROFILE + BELL (DESKTOP) */}
          <div className="nav-leading">
            <button className="profile-btn" onClick={onToggleSidebar} aria-label="Profile">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  style={{ width: 28, height: 28, borderRadius: '999px', objectFit: 'cover' }}
                />
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="#93c5fd" strokeWidth="1.5" />
                  <circle cx="12" cy="9" r="3" stroke="#93c5fd" strokeWidth="1.5" />
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
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3C9.79086 3 8 4.79086 8 7V8.1c0 .83-.26 1.64-.74 2.32L6.11 12.07c-.72 1.02-.01 2.43 1.27 2.43H16.6c1.28 0 2-1.41 1.27-2.43L15.74 10.4c-.47-.68-.74-1.49-.74-2.32V7c0-2.21-1.8-4-4-4z"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M10 16c.27 1.17 1.31 2 2.5 2s2.23-.83 2.5-2"
                    stroke="#93c5fd"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
                {hasUnreadNotifications && <span className="nav-bell-dot" />}
              </button>
            )}
          </div>

          {/* SEARCH — DESKTOP */}
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

          {/* RIGHT SIDE — DESKTOP LINKS */}
          <div className="nav-links">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/add" className="nav-link">Add Post</Link>

            {user ? (
              <>
                <span className="nav-user">Hi, {user.name}</span>
                <button className="btn btn-danger" onClick={onLogout}>Logout</button>
              </>
            ) : (
              <>
                <button className="btn btn-secondary" onClick={() => navigate('/login')}>Login</button>
                <button className="btn btn-primary" onClick={() => navigate('/register')}>Register</button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* ===========================
          MOBILE BOTTOM NAVBAR
      ============================ */}
      <div className="mobile-bottombar">
        <Link to="/" className="bottom-icon">🏠</Link>
        <Link to="/add" className="bottom-icon">➕</Link>
        <button onClick={onToggleSidebar} className="bottom-icon">👤</button>
      </div>
    </>
  );
};

export default Navbar;
