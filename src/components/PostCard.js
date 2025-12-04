import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './PostCard.css';

const PostCard = ({ post, user, onDelete, onLike, showDelete = true }) => {
  const navigate = useNavigate();
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const truncateContent = (content, maxLength = 150) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const canEdit = user && (user.name === post.author || user.email === post.author);

  const likeCount = (post.likes || []).length;
  const viewerId = user?.id || 'guest';
  const liked = (post.likes || []).includes(viewerId);

  return (
    <article className="post-card aurora-stroke">
      {post.thumbnail && (
        <div className="post-thumb">
          <img src={post.thumbnail} alt={post.title} />
        </div>
      )}
      <div className="post-card-header">
        <h3 className="post-title">
          <Link
            to={user ? `/post/${post.id}` : '/login'}
            className="post-title-link"
          >
            {post.title}
          </Link>
        </h3>
        <div className="post-meta">
          <span className="post-author">By {post.author}</span>
          {post.genre && (
            <span className="post-genre">• {post.genre}</span>
          )}
          <span className="post-date">{formatDate(post.createdAt)}</span>
        </div>
      </div>
      
      <div className="post-card-body">
        {post.description && (
          <p className="post-desc">{truncateContent(post.description, 180)}</p>
        )}
      </div>
      
      <div className="post-card-footer">
        <div className="post-engage">
          <button className={`icon-btn ${liked ? 'liked' : ''}`} onClick={() => onLike(post.id)} title="Like">
            ❤ {likeCount}
          </button>
          <span className="icon-muted">💬 {(post.comments || []).length}</span>
        </div>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => {
            if (user) {
              navigate(`/post/${post.id}`);
            } else {
              navigate('/login');
            }
          }}
        >
          Read More
        </button>
        {canEdit && showDelete && (
          <div className="post-actions">
            <button 
              onClick={() => onDelete(post.id)}
              className="btn btn-danger btn-sm"
              title="Delete post"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </article>
  );
};

export default PostCard;
