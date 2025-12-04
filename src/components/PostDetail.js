import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './PostDetail.css';

const PostDetail = ({ posts, user, onUpdatePost, onDeletePost, onLikePost, onAddComment, onToggleFollow }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', content: '', thumbnail: '' });
  const [commentText, setCommentText] = useState('');

  const post = posts.find(p => p.id === id);

  useEffect(() => {
    if (user && post) {
      const key = `seenPosts:${user.id}`;
      let seen = [];
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          seen = JSON.parse(stored);
        }
      } catch (e) {
        seen = [];
      }
      if (!Array.isArray(seen)) {
        seen = [];
      }
      if (!seen.includes(post.id)) {
        const next = [...seen, post.id];
        localStorage.setItem(key, JSON.stringify(next));
      }
    }
  }, [user, post]);

  if (!post) {
    return (
      <div className="post-detail">
        <div className="container">
          <div className="post-not-found">
            <h2>Post Not Found</h2>
            <p>The blog post you're looking for doesn't exist or has been removed.</p>
            <Link to="/" className="btn btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="post-detail">
        <div className="container">
          <div className="post-not-found">
            <h2>Login required</h2>
            <p>You need to login to view this post.</p>
            <button className="btn btn-primary" onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canEdit = user && (user.name === post.author || user.email === post.author);
  const likeCount = (post.likes || []).length;
  const viewerId = user?.id || 'guest';
  const hasLiked = (post.likes || []).includes(viewerId);
  const isOwnPost = user?.id && post.authorId && user.id === post.authorId;
  const isFollowingAuthor =
    !!user?.following && Array.isArray(user.following) && post.authorId
      ? user.following.includes(post.authorId)
      : false;

  const handleEdit = () => {
    setEditData({
      title: post.title,
      content: post.content,
      thumbnail: post.thumbnail || ''
    });
    setIsEditing(true);
  };

  const handleSave = () => {
    if (!editData.title.trim() || !editData.content.trim()) {
      alert('Title and content are required');
      return;
    }

    const updatedPost = {
      ...post,
      title: editData.title.trim(),
      content: editData.content.trim(),
      thumbnail: editData.thumbnail,
      updatedAt: new Date().toISOString()
    };

    onUpdatePost(updatedPost);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({ title: '', content: '' });
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      onDeletePost(post.id);
      navigate('/');
    }
  };

  const handleAddComment = () => {
    const text = commentText.trim();
    if (!text) return;
    onAddComment(post.id, text);
    setCommentText('');
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setEditData((prev) => ({ ...prev, thumbnail: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="post-detail">
      <div className="container">
        <div className="post-detail-content">
          <div className="post-detail-header">
            <div className="post-breadcrumb">
              <Link to="/" className="breadcrumb-link">← Back to Posts</Link>
            </div>
            
            {isEditing ? (
              <div className="edit-form">
                <input
                  type="text"
                  value={editData.title}
                  onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                  className="form-input edit-title"
                  placeholder="Post title..."
                />
              </div>
            ) : (
              <h1 className="post-detail-title">{post.title}</h1>
            )}

            <div className="post-detail-meta">
              <div className="post-author-info">
                <span className="post-author">By {post.author}</span>
                <span className="post-date">
                  {formatDate(post.createdAt)}
                  {post.updatedAt && (
                    <span className="updated-indicator"> (updated)</span>
                  )}
                </span>
              </div>
              
              {canEdit && !isEditing && (
                <div className="post-actions">
                  <button onClick={handleEdit} className="btn btn-secondary btn-sm">
                    Edit
                  </button>
                  <button onClick={handleDelete} className="btn btn-danger btn-sm">
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="post-detail-body">
            {post.thumbnail && !isEditing && (
              <div className="detail-thumb">
                <img src={post.thumbnail} alt={post.title} />
              </div>
            )}
            <p className="detail-description">{post.description}</p>
            <div className="detail-engage">
              <button className={`icon-btn ${hasLiked ? 'liked' : ''}`} onClick={() => onLikePost(post.id)}>
                ❤ {likeCount}
              </button>
              <button className="icon-btn" onClick={() => navigator.share ? navigator.share({ title: post.title, text: post.description, url: window.location.href }) : window.alert('Sharing not supported on this browser')}>
                ↗ Share
              </button>
              {!isOwnPost && (
                <button
                  className="icon-btn"
                  onClick={() => onToggleFollow && onToggleFollow(post.authorId)}
                >
                  {isFollowingAuthor ? 'Following' : 'Follow'}
                </button>
              )}
            </div>
            {isEditing ? (
              <div className="edit-form">
                <div className="form-group" style={{ marginBottom: 16 }}>
                  <label className="form-label">Thumbnail image</label>
                  {editData.thumbnail && (
                    <div className="detail-thumb" style={{ marginBottom: 8 }}>
                      <img src={editData.thumbnail} alt="Thumbnail preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="form-input"
                  />
                </div>
                <textarea
                  value={editData.content}
                  onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                  className="form-textarea edit-content"
                  rows={20}
                  placeholder="Post content..."
                />
                <div className="edit-actions">
                  <button onClick={handleCancel} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button onClick={handleSave} className="btn btn-primary">
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className="post-content">
                {post.content.split('\n').map((paragraph, index) => (
                  <p key={index} className="post-paragraph">
                    {paragraph}
                  </p>
                ))}
              </div>
            )}

            <div className="comments-section">
              <h3>Comments ({(post.comments || []).length})</h3>
              <div className="comment-input">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="form-input"
                  placeholder="Write a comment..."
                />
                <button className="btn btn-primary" onClick={handleAddComment}>Post</button>
              </div>
              <div className="comment-list">
                {(post.comments || []).map(c => (
                  <div className="comment-item" key={c.id}>
                    <div className="comment-meta">
                      <span className="comment-author">{c.author}</span>
                      <span className="comment-date">{formatDate(c.createdAt)}</span>
                    </div>
                    <p className="comment-text">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
