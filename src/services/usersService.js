const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:5000/api';

const handle = async (res) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = data?.error || 'Something went wrong';
    throw new Error(message);
  }
  return data;
};

export const PASSWORD_HELPER =
  'Password must be at least 6 characters and include uppercase, lowercase, and a number.';

export function validatePassword(password) {
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,}$/.test(password);
}

export async function registerUser(payload) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function loginUser(payload) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handle(res);
}

export async function fetchSecurityQuestion(identifier) {
  const res = await fetch(`${API_BASE}/auth/security-question`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier }),
  });
  return handle(res);
}

export async function verifySecurityAnswer(identifier, answer) {
  const res = await fetch(`${API_BASE}/auth/security-verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, answer }),
  });
  return handle(res);
}

export async function changePassword(userId, newPassword) {
  const res = await fetch(`${API_BASE}/auth/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, newPassword }),
  });
  return handle(res);
}

export async function toggleFollowUser(targetUserId, followerId) {
  const res = await fetch(`${API_BASE}/users/${encodeURIComponent(targetUserId)}/follow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ followerId }),
  });
  return handle(res);
}

export async function updateProfile(userId, profile) {
  const res = await fetch(`${API_BASE}/users/update/${userId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(profile),
  });
  return handle(res);
}
