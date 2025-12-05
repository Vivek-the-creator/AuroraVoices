import React, { useState, useEffect } from 'react';
import { subscribeToPosts, createPost as createPostDb, updatePost as updatePostDb, removePost as removePostDb, toggleLike as toggleLikeDb, addComment as addCommentDb } from './services/postsService';
import { fetchNotifications, markNotificationsRead } from './services/notificationsService';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './components/HomePage';
import AddPost from './components/AddPost';
import PostDetail from './components/PostDetail';
import Login from './components/Login';
import Register from './components/Register';
import Navbar from './components/Navbar';
import ProfileSidebar from './components/ProfileSidebar';
import NotificationsSidebar from './components/NotificationsSidebar';
import MyProfile from './components/pages/MyProfile';
import MyPosts from './components/pages/MyPosts';
import LikedPosts from './components/pages/LikedPosts';
import Settings from './components/pages/Settings';
import './App.css';
import { toggleFollowUser as toggleFollowUserApi } from './services/usersService';

// Helper: persist a lightweight version of the user in localStorage
const persistUserToStorage = (user) => {
  try {
    if (!user) {
      localStorage.removeItem('blogUser');
      return;
    }
    // Avoid storing large fields like avatar (data URLs) to prevent quota issues
    const { avatar, ...rest } = user || {};
    localStorage.setItem('blogUser', JSON.stringify(rest));
  } catch (e) {
    // Swallow quota / access errors so the app doesn't crash
    console.error('Failed to persist user in localStorage', e);
  }
};

function App() {
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState(null);
  useEffect(() => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;
  
    fetch(`${process.env.REACT_APP_API_BASE}/users/${userId}`)
      .then(res => res.json())
      .then(data => {
        setUser(data); // ✅ avatar restored from DB
      })
      .catch(() => {
        localStorage.removeItem('userId');
      });
  }, []);

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to API posts stored in MongoDB
  useEffect(() => {
    const unsub = subscribeToPosts(setPosts);
    return () => unsub && unsub();
  }, []);

  // Load user from localStorage on component mount (and hydrate avatar from saved profile)
  useEffect(() => {
    const savedUser = localStorage.getItem('blogUser');
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      try {
        if (parsed?.id) {
          const savedProfile = localStorage.getItem(`profile:${parsed.id}`);
          if (savedProfile) {
            const profileData = JSON.parse(savedProfile);
            // prefer avatar from profile storage if present
            const hydrated = profileData.avatar
              ? { ...parsed, avatar: profileData.avatar }
              : parsed;
            setUser(hydrated);
            return;
          }
        }
      } catch (e) {
        // fallback to parsed user if profile parsing fails
      }
      setUser(parsed);
    }
  }, []);

  // Ensure avatar is hydrated from profile storage even if blogUser has no avatar
  useEffect(() => {
    if (!user?.id || user.avatar) return;
    try {
      const savedProfile = localStorage.getItem(`profile:${user.id}`);
      if (!savedProfile) return;
      const profileData = JSON.parse(savedProfile);
      if (profileData?.avatar) {
        setUser((prev) => {
          if (!prev) return prev;
          if (prev.avatar === profileData.avatar) return prev;
          return { ...prev, avatar: profileData.avatar };
        });
      }
    } catch (e) {
      // ignore parse errors
    }
  }, [user?.id, user?.avatar]);

  // Save user to localStorage whenever user changes
  useEffect(() => {
    persistUserToStorage(user);
  }, [user]);

  // Poll notifications for the logged-in user
  useEffect(() => {
    if (!user?.id) {
      setNotifications([]);
      setHasUnreadNotifications(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      const list = await fetchNotifications(user.id);
      if (cancelled) return;
      setNotifications(list);
      setHasUnreadNotifications(list.some((n) => !n.read));
    };

    load();
    const id = setInterval(load, 60 * 1000); // refresh every minute
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [user?.id]);

  const addPost = async (newPost) => {
    const payload = {
      ...newPost,
      author: newPost.author?.trim() || (user ? user.name : 'Anonymous'),
      authorId: user?.id || 'guest',
      authorUsername: user?.username || ''
    };
    await createPostDb(payload);
  };

  const updatePost = async (updatedPost) => {
    await updatePostDb(updatedPost);
  };

  const deletePost = async (postId) => {
    await removePostDb(postId);
  };

  const toggleLike = async (postId) => {
    const viewerId = user?.id || 'guest';
    await toggleLikeDb(postId, viewerId);
  };

  const addComment = async (postId, text) => {
    const authorName = user?.name || 'Anonymous';
    const comment = {
      id: Date.now().toString(),
      author: authorName,
      authorId: user?.id || 'guest',
      authorUsername: user?.username || '',
      text,
      createdAt: new Date().toISOString()
    };
    await addCommentDb(postId, comment);
  };

  const toggleFollowUser = async (targetUserId) => {
    if (!user?.id || !targetUserId || user.id === targetUserId) return;
    try {
      const result = await toggleFollowUserApi(targetUserId, user.id);
      if (result?.follower) {
        setUser(result.follower);
      }
    } catch (e) {
      console.error('Failed to toggle follow', e);
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setNotifications([]);
    setHasUnreadNotifications(false);
  };

  const handleUpdateUser = (updated) => {
    setUser(prev => {
      const next = { ...prev, ...updated };
      return next;
    });
  };

  const postsArray = Array.isArray(posts) ? posts : [];

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const hasSearch = !!trimmedQuery;

  let matchCount = 0;

  const orderedPosts = (() => {
    if (!trimmedQuery) return postsArray;

    const matches = [];
    const rest = [];

    postsArray.forEach((p) => {
      const title = (p.title || '').toLowerCase();
      const author = (p.author || '').toLowerCase();
      const username = (p.authorUsername || '').toLowerCase();
      const genre = (p.genre || '').toLowerCase();

      const isMatch =
        title.includes(trimmedQuery) ||
        author.includes(trimmedQuery) ||
        username.includes(trimmedQuery) ||
        genre.includes(trimmedQuery);

      if (isMatch) {
        matches.push(p);
      } else {
        rest.push(p);
      }
    });

    matchCount = matches.length;
    return [...matches, ...rest];
  })();

  // Re-order posts so that new, unseen posts from followed authors appear on top
  const finalOrderedPosts = (() => {
    const followingIds = Array.isArray(user?.following) ? user.following : [];
    if (!user || followingIds.length === 0) return orderedPosts;

    let seenIds = [];
    try {
      const stored = localStorage.getItem(`seenPosts:${user.id}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) seenIds = parsed;
      }
    } catch (e) {
      // ignore parse errors
    }

    const seenSet = new Set(seenIds);

    const top = [];
    const rest = [];

    orderedPosts.forEach((p) => {
      if (p.authorId && followingIds.includes(p.authorId) && !seenSet.has(p.id)) {
        top.push(p);
      } else {
        rest.push(p);
      }
    });

    return [...top, ...rest];
  })();

  const suggestions = hasSearch
    ? Array.from(
        new Set(
          postsArray
            .flatMap((p) => [
              p.title,
              p.author,
              p.authorUsername,
              p.genre,
            ])
            .filter(Boolean)
            .map((v) => v.trim())
        )
      )
        .filter((value) => value.toLowerCase().includes(trimmedQuery))
        .slice(0, 8)
    : [];

  return (
    <Router>
      <div className="App aurora-bg">
        <Navbar 
          user={user} 
          onLogout={handleLogout}
          onToggleSidebar={() => setIsSidebarOpen(true)}
          onToggleNotifications={async () => {
            if (!user?.id) return;
            const nextOpen = !isNotificationsOpen;
            setIsNotificationsOpen(nextOpen);
            if (nextOpen) {
              await markNotificationsRead(user.id);
              // Optimistically mark read locally
              setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
              setHasUnreadNotifications(false);
            }
          }}
          hasUnreadNotifications={hasUnreadNotifications}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          suggestions={suggestions}
          onSelectSuggestion={(value) => setSearchQuery(value)}
        />
        <ProfileSidebar 
          user={user}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />

        <NotificationsSidebar
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          notifications={notifications}
        />

        <main className="main-content">
          <Routes>
            <Route 
              path="/" 
              element={
                <HomePage 
                  posts={finalOrderedPosts} 
                  user={user}
                  hasSearch={hasSearch}
                  matchCount={matchCount}
                  onDeletePost={deletePost}
                  onLikePost={toggleLike}
                />
              } 
            />
            <Route 
              path="/add" 
              element={
                <AddPost 
                  onAddPost={addPost} 
                  user={user}
                />
              } 
            />
            <Route 
              path="/post/:id" 
              element={
                <PostDetail 
                  posts={posts} 
                  user={user}
                  onUpdatePost={updatePost}
                  onDeletePost={deletePost}
                  onLikePost={toggleLike}
                  onAddComment={addComment}
                  onToggleFollow={toggleFollowUser}
                />
              } 
            />
            <Route path="/me" element={<MyProfile user={user} onUpdateUser={handleUpdateUser} />} />
            <Route path="/me/posts" element={<MyPosts user={user} posts={posts} onDeletePost={deletePost} onLikePost={toggleLike} />} />
            <Route path="/me/likes" element={<LikedPosts user={user} posts={posts} onLikePost={toggleLike} />} />
            <Route path="/settings" element={<Settings user={user} onLogout={handleLogout} />} />
            <Route 
              path="/login" 
              element={
                <Login 
                  onLogin={handleLogin}
                />
              } 
            />
            <Route 
              path="/register" 
              element={
                <Register 
                  onLogin={handleLogin}
                />
              } 
            />
          </Routes>
        </main>

        {/* footer removed per request */}
      </div>
    </Router>
  );
}

export default App;
