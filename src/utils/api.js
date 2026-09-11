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

// Render free-tier cold starts can take ~50s: the first request may fail at
// the network level (or return a non-JSON proxy page) while the backend wakes.
// Retries ONLY those network-level failures — never HTTP error statuses —
// so genuine backend errors are always surfaced, never hidden.
export async function fetchWithWakeRetry(url, options = {}, retries = 2) {
  const delays = [4000, 12000];
  let lastError;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      const data = await res.json().catch(() => null);
      if (data === null) throw new Error('Non-JSON response (backend may be waking up)');
      return { res, data };
    } catch (err) {
      lastError = err;
      if (attempt < retries) await new Promise((r) => setTimeout(r, delays[attempt] || 12000));
    }
  }
  throw lastError;
}
