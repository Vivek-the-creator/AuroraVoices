import React from 'react';
import PostCard from '../PostCard';

const LikedPosts = ({ user, posts = [], onLikePost }) => {
  const viewerId = user?.id || 'guest';
  const liked = posts.filter(p => (p.likes || []).includes(viewerId));
  return (
    <div className="container" style={{ paddingTop: 24 }}>
      <h2 style={{ color: '#a7f3d0', marginBottom: 16 }}>Liked Posts</h2>
      {liked.length === 0 ? (
        <p>You haven't liked any posts yet.</p>
      ) : (
        <div className="posts-grid">
          {liked.map(p => (
            <PostCard 
              key={p.id} 
              post={p} 
              user={user}
              onLike={onLikePost}
              showDelete={false}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default LikedPosts;


