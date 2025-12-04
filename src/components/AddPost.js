import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AddPost.css';

const AddPost = ({ onAddPost, user }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    author: user?.name || '',
    genre: '',
    thumbnail: '',
    content: ''
  });
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'thumbnailFile') {
      const file = files?.[0];
      setThumbnailFile(file || null);
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          setFormData(prev => ({ ...prev, thumbnail: reader.result }));
        };
        reader.readAsDataURL(file);
      }
      return;
    }
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    } else if (formData.title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Short description is required';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!formData.author.trim()) {
      newErrors.author = 'Author name is required';
    }

    if (!formData.thumbnail.trim()) {
      newErrors.thumbnail = 'Thumbnail image is required (upload or URL)';
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Content is required';
    } else if (formData.content.trim().length < 50) {
      newErrors.content = 'Content must be at least 50 characters long';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const newPost = {
      title: formData.title.trim(),
      description: formData.description.trim(),
      author: formData.author.trim() || (user ? user.name : 'Anonymous'),
      genre: formData.genre.trim(),
      thumbnail: formData.thumbnail.trim(),
      content: formData.content.trim()
    };

    onAddPost(newPost);
    navigate('/');
  };

  if (!user) {
    return (
      <div className="add-post">
        <div className="container">
          <div className="auth-required">
            <h2>Authentication Required</h2>
            <p>Please log in or register to create a new blog post.</p>
            <div className="auth-actions">
              <button 
                onClick={() => navigate('/login')}
                className="btn btn-primary"
              >
                Login
              </button>
              <button 
                onClick={() => navigate('/register')}
                className="btn btn-secondary"
              >
                Register
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="add-post">
      <div className="container">
        <div className="add-post-header">
          <h1>Create New Post</h1>
          <p>Share your thoughts and ideas with the community</p>
        </div>

        <div className="add-post-form-container">
          <form onSubmit={handleSubmit} className="add-post-form">
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Post Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`form-input ${errors.title ? 'error' : ''}`}
                placeholder="Enter a compelling title for your post..."
                maxLength={100}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Short Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className={`form-textarea ${errors.description ? 'error' : ''}`}
                placeholder="A short teaser about your poem..."
                rows={4}
                maxLength={300}
              />
              {errors.description && (
                <span className="error-message">{errors.description}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="author" className="form-label">
                Author Name
              </label>
              <input
                type="text"
                id="author"
                name="author"
                value={formData.author}
                onChange={handleChange}
                className={`form-input ${errors.author ? 'error' : ''}`}
                placeholder="Your name"
                maxLength={80}
              />
              {errors.author && (
                <span className="error-message">{errors.author}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="genre" className="form-label">
                Genre (optional)
              </label>
              <input
                type="text"
                id="genre"
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="form-input"
                placeholder="e.g., Love, Nature, Philosophy..."
                maxLength={60}
              />
            </div>

            <div className="form-group">
              <label htmlFor="thumbnail" className="form-label">
                Thumbnail Image
              </label>
              <input
                type="url"
                id="thumbnail"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className={`form-input ${errors.thumbnail ? 'error' : ''}`}
                placeholder="https://... image URL (optional if you upload)"
              />
              <div style={{ display: 'flex', gap: 12, marginTop: 8, alignItems: 'center' }}>
                <input type="file" accept="image/*" name="thumbnailFile" id="thumbnailFile" onChange={handleChange} />
                {formData.thumbnail && (
                  <img src={formData.thumbnail} alt="preview" style={{ width: 64, height: 48, objectFit: 'cover', borderRadius: 6, border: '1px solid #334155' }} />
                )}
              </div>
              {errors.thumbnail && (
                <span className="error-message">{errors.thumbnail}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="content" className="form-label">
                Post Content
              </label>
              <textarea
                id="content"
                name="content"
                value={formData.content}
                onChange={handleChange}
                className={`form-textarea ${errors.content ? 'error' : ''}`}
                placeholder="Write your blog post content here... Share your ideas, experiences, and insights with the community."
                rows={12}
                maxLength={5000}
              />
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
              <div className="character-count">
                {formData.content.length}/5000 characters
              </div>
            </div>

            <div className="form-actions">
              <button
                type="button"
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={
                  !formData.title.trim() ||
                  !formData.description.trim() ||
                  !formData.author.trim() ||
                  !formData.thumbnail.trim() ||
                  !formData.content.trim()
                }
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
