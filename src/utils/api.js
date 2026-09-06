// Production fallback ensures Netlify build never becomes "/api" if VITE_API_URL is missing.
// Netlify env var VITE_API_URL=https://eskraft-backend.onrender.com overrides this at build time.
// Local dev uses .env VITE_API_URL=http://localhost:5000
export const API = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://eskraft-backend.onrender.com' : 'http://localhost:5000')) + '/api';
export async function apiFetch(path, opts={}) {
  const token = localStorage.getItem('eskraft-token');
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw Object.assign(new Error(data.error?.message||'Request failed'), { data, status: res.status });
  return data;
}
