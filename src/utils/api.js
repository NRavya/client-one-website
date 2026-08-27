export const API = '/api';
export async function apiFetch(path, opts={}) {
  const token = localStorage.getItem('eskraft-token');
  const headers = { 'Content-Type':'application/json', ...(opts.headers||{}) };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...opts, headers });
  const data = await res.json().catch(()=>({}));
  if (!res.ok) throw Object.assign(new Error(data.error?.message||'Request failed'), { data, status: res.status });
  return data;
}
