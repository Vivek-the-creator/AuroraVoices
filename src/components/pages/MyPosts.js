import React from 'react';
import PostCard from '../PostCard';

const MyPosts = ({ user, posts = [], onDeletePost, onLikePost }) => {
  const viewerId = user?.id || 'guest';
  const mine = user ? posts.filter(p => (p.authorId === viewerId) || (p.author === user.name)) : [];
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h2 style={{ color: '#a7f3d0', marginBottom: 16 }}>My Posts</h2>
      {mine.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        <div className="posts-grid">
          {mine.map(p => (
            <PostCard 
              key={p.id} 
              post={p} 
              user={user}
              onDelete={onDeletePost}
              onLike={onLikePost}
              showDelete={true}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPosts;


