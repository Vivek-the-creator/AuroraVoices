import React from 'react';
import './NotificationsSidebar.css';

const formatTime = (dateString) => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const NotificationsSidebar = ({ isOpen, onClose, notifications }) => {
  if (!isOpen) return null;

  return (
    <aside className="notifications-sidebar" aria-label="Notifications">
      <div className="notifications-sidebar-header">
        <div className="notifications-title">Notifications</div>
        <button
          type="button"
          className="notifications-close-btn"
          onClick={onClose}
          aria-label="Close notifications"
        >
          ✕
        </button>
      </div>

      <div className="notifications-list">
        {(!notifications || notifications.length === 0) && (
          <div className="notification-empty">
            You're all caught up.
            <br />
            New likes and comments on your posts will appear here.
          </div>
        )}

        {notifications &&
          notifications.map((n) => {
            const isLike = n.type === 'like';
            const isComment = n.type === 'comment';
            const isFollow = n.type === 'follow';

            let message = '';
            if (isLike) {
              message = `${n.actorUsername} liked your post "${n.postTitle}"`;
            } else if (isComment) {
              message = `${n.actorUsername} commented on your post "${n.postTitle}": "${n.commentText}"`;
            } else if (isFollow) {
              message = `${n.actorUsername} started following you`;
            } else {
              message = `${n.actorUsername} sent you a notification`;
            }
            return (
              <div
                key={n._id || `${n.type}-${n.postId}-${n.actorId}-${n.createdAt}`}
                className={`notification-item ${n.read ? '' : 'unread'}`}
              >
                <div className="notification-main">
                  <strong>{message}</strong>
                </div>
                <div className="notification-meta">
                  <span>
                    {isLike ? 'Like' : isComment ? 'Comment' : isFollow ? 'Follow' : ''}
                  </span>
                  <span>{formatTime(n.createdAt)}</span>
                </div>
              </div>
            );
          })}
      </div>

      <div className="notifications-sidebar-footer">
        Notifications are kept for the last 12 hours to avoid extra storage.
      </div>
    </aside>
  );
};

export default NotificationsSidebar;


