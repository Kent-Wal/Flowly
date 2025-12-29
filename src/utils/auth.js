// Simple auth helper used by the client to register or login and store the token
export async function authUser(action, payload) {
  // action: 'register' or 'login'
  const endpoint = action === 'register' ? '/auth/register' : '/auth/login';

  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    // Prefer `error` or `message` fields from the server response so the UI can show a friendly message
    const msg = data?.error || data?.message || `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = data;
    throw err;
  }

  const token = data?.token;
  if (!token) {
    const err = new Error('No token returned from server');
    err.status = res.status;
    err.body = data;
    throw err;
  }

  // store token for later requests
  localStorage.setItem('authToken', token);

  // notify other parts of the app in this window
  try {
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { token } }));
  } catch (e) {
    // ignore if window not available (e.g., server-side)
  }

  return data;
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}

export function logout() {
  localStorage.removeItem('authToken');
  try {
    window.dispatchEvent(new CustomEvent('authChanged', { detail: { token: null } }));
  } catch (e) {}
}

// Decode stored JWT and return the user id if present. Returns null if token missing/invalid.
export function getUserId() {
  const token = getAuthToken();
  if (!token) return null;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const payload = parts[1];
    // atob is available in browsers; fall back if needed
    const json = JSON.parse(decodeURIComponent(escape(window.atob(payload))));
    return json?.id ?? null;
  } catch (e) {
    return null;
  }
}
