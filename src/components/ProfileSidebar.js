import React from 'react';
import { Link } from 'react-router-dom';
import './ProfileSidebar.css';

const ProfileSidebar = ({ user, isOpen, onClose }) => {
  return (
    <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`} onClick={(e) => e.stopPropagation()}>
        <div className="sidebar-header">
          <div className="avatar">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt="Profile"
                style={{ width: '100%', height: '100%', borderRadius: '999px', objectFit: 'cover' }}
              />
            ) : (
              user?.name?.[0]?.toUpperCase() || 'A'
            )}
          </div>
          <div>
            <div className="name">{user?.name || 'Guest'}</div>
            <div className="email">{user?.email || 'guest@example.com'}</div>
          </div>
        </div>
        <nav className="sidebar-nav">
          <Link to="/me" className="sidebar-link" onClick={onClose}>My Profile</Link>
          <Link to="/me/posts" className="sidebar-link" onClick={onClose}>My Posts</Link>
          <Link to="/me/likes" className="sidebar-link" onClick={onClose}>Liked Posts</Link>
          <div className="spacer" />
          <Link to="/settings" className="sidebar-link muted" onClick={onClose}>Settings</Link>
        </nav>
      </aside>
    </div>
  );
};

export default ProfileSidebar;








