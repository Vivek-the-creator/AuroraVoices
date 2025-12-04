// REST-backed service using local file storage via Express server

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export function subscribeToPosts(onChange) {
  // Simple polling to reflect changes; could be replaced with websockets
  const fetchNow = async () => {
    try {
      const res = await fetch(`${API_BASE}/posts`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : (Array.isArray(data?.posts) ? data.posts : []);
      onChange(list);
    } catch (e) {
      console.error('Failed to fetch posts from API.', e);
      onChange([]);
    }
  };
  fetchNow();
  const id = setInterval(fetchNow, 3000);
  return () => clearInterval(id);
}

export async function createPost(newPost) {
  const res = await fetch(`${API_BASE}/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newPost)
  });
  return await res.json();
}

export async function updatePost(updated) {
  const res = await fetch(`${API_BASE}/posts/${updated.id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updated)
  });
  return await res.json();
}

export async function removePost(id) {
  await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
}

export async function toggleLike(postId, viewerId) {
  const res = await fetch(`${API_BASE}/posts/${postId}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ viewerId })
  });
  return await res.json();
}

export async function addComment(postId, comment) {
  const res = await fetch(`${API_BASE}/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comment })
  });
  return await res.json();
}


