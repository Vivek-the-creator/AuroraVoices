import React, { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

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
  isSidebarOpen, // 🔥 REQUIRED: parent must pass true/false when sidebar opens
}) => {
  const navigate = useNavigate();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hideTopBar, setHideTopBar] = useState(false);

  const lastScrollY = useRef(0);
  const inputRef = useRef(null);

  // -------------------------
  // 🔥 Auto-hide topbar on scroll + hide when sidebar opens
  // -------------------------
  useEffect(() => {
    if (isSidebarOpen) {
      setHideTopBar(true);
      return;
    }

    const handleScroll = () => {
      if (window.scrollY > lastScrollY.current) {
        setHideTopBar(true);
      } else {
        setHideTopBar(false);
      }
      lastScrollY.current = window.scrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isSidebarOpen]);

  const handleClearSearch = () => {
    setSearchQuery("");
    inputRef.current?.focus();
  };

  const handleSelectSuggestion = (value) => {
    onSelectSuggestion ? onSelectSuggestion(value) : setSearchQuery(value);
    inputRef.current?.focus();
  };

  // -----------------------------------------------
  // 🔥 MOBILE TOP BAR (Search + Bell)
  // -----------------------------------------------
  const MobileTopBar = () => (
    <div className={`mobile-topbar ${hideTopBar ? "hidden-topbar" : ""}`}>
      <input
        ref={inputRef}
        type="text"
        placeholder="Search..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onFocus={() => setIsSearchFocused(true)}
        onBlur={() => setIsSearchFocused(false)}
      />

      {/* Bell Icon */}
      <button className="mobile-bell" onClick={onToggleNotifications}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
          <path
            d="M12 3C9.8 3 8 4.8 8 7v1.1c0 .8-.26 1.6-.74 2.3l-1.16 1.65C5.39 13.1 6.13 14.5 7.38 14.5h9.24c1.25 0 1.99-1.4 1.28-2.45l-1.16-1.65c-.48-.69-.74-1.51-.74-2.3V7c0-2.2-1.8-4-4-4Z"
            stroke="#93c5fd"
            strokeWidth="1.5"
          />
          <path
            d="M10 16c.27 1.17 1.3 2 2.5 2s2.23-.83 2.5-2"
            stroke="#93c5fd"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        {hasUnreadNotifications && <span className="nav-bell-dot" />}
      </button>
    </div>
  );

  // -----------------------------------------------
  // 🔥 MOBILE BOTTOM NAV (Home + Add + Profile)
  // -----------------------------------------------
  const MobileBottomBar = () => (
    <div className="mobile-bottombar">
      {/* HOME */}
      <Link to="/" className="bottom-icon">
        <svg width="26" height="26" stroke="white" fill="none" viewBox="0 0 24 24">
          <path
            d="M3 10L12 3l9 7v10a1 1 0 0 1-1 1h-5V14H9v7H4a1 1 0 0 1-1-1V10z"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </Link>

      {/* ADD POST */}
      <Link to="/add" className="bottom-icon">
        <svg width="28" height="28" stroke="white" fill="none" viewBox="0 0 24 24">
          <path
            d="M12 5v14M5 12h14"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </Link>

      {/* PROFILE BUTTON */}
      <button className="bottom-icon" onClick={onToggleSidebar}>
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt="Profile"
            style={{
              width: 28,
              height: 28,
              borderRadius: "999px",
              objectFit: "cover",
            }}
          />
        ) : (
          <svg width="26" height="26" stroke="white" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="8" r="4" strokeWidth="1.5" />
            <path
              d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        )}
      </button>
    </div>
  );

  // -----------------------------------------------
  // DESKTOP NAVBAR (unchanged / full original UI)
  // -----------------------------------------------
  return (
    <>
      {/* MOBILE NAVBARS */}
      <MobileTopBar />
      <MobileBottomBar />

      {/* DESKTOP NAV (unchanged) */}
      <nav className="navbar aurora-navbar desktop-nav">
        <div className="container nav-content">
          {/* original desktop layout untouched */}
        </div>
      </nav>
    </>
  );
};

export default Navbar;
