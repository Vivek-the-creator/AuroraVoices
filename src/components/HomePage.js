import React from 'react';
import { Link } from 'react-router-dom';
import PostCard from './PostCard';
import './HomePage.css';

const HomePage = ({ posts, user, hasSearch = false, matchCount = 0, onDeletePost, onLikePost }) => {
  return (
    <div className="homepage">
      <div className="container">
        <div className="aurora-hero">
          <div className="hero-logo" aria-label="Aurora Voices logo">
            <img src={process.env.PUBLIC_URL + '/Aurora%20Voices.jpg'} alt="Aurora Voices" />
          </div>
          <h1 className="hero-title">Where Words Dance With Light</h1>
          <p className="hero-subtitle">A Multilingual Journey Through Poetry</p>
          <Link to="/add" className="btn btn-primary hero-cta">Add Post</Link>
        </div>

        {hasSearch && matchCount === 0 && (
          <div style={{ marginTop: 24, marginBottom: 8, color: '#e5e7eb' }}>
            <p>No results found for your search. Showing all poems instead.</p>
          </div>
        )}

        {posts.length > 0 && (
          <div className="posts-section">
            <h2 className="section-title" style={{ color: '#ffffff' }}>Latest Poems</h2>
            <div className="posts-grid">
              {posts.map(post => (
                <PostCard
                  key={post.id}
                  post={post}
                  user={user}
                  onDelete={onDeletePost}
                  onLike={onLikePost}
                  showDelete={false}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
