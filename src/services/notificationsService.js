const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

export async function fetchNotifications(userId) {
  if (!userId) return [];
  try {
    const params = new URLSearchParams({ userId });
    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`);
    if (!res.ok) {
      console.error('Failed to fetch notifications: HTTP', res.status);
      return [];
    }
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.error('Failed to fetch notifications', e);
    return [];
  }
}

export async function markNotificationsRead(userId) {
  if (!userId) return;
  try {
    await fetch(`${API_BASE}/notifications/mark-read`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
  } catch (e) {
    console.error('Failed to mark notifications as read', e);
  }
}


