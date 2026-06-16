// API base URL for production (Vercel). Leave unset in local dev — Vite proxies to Express.
const API_BASE = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

export function apiUrl(path) {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${normalized}`;
}

export function apiFetch(path, options) {
  return fetch(apiUrl(path), options);
}
