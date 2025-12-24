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
    const msg = data?.message || `Request failed (${res.status})`;
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

  return data;
}

export function getAuthToken() {
  return localStorage.getItem('authToken');
}
