export function apiBase() {
  if (typeof window !== 'undefined') {
    // Production (Vercel)
    if (process.env.VITE_API_URL) {
      return process.env.VITE_API_URL;
    }
    
    // Development
    if (window.location.port === '3000' || window.location.port === '5173') {
      return 'http://localhost:4000/api';
    }
    
    const pathPrefix = window.location.pathname.includes('/my-app') ? '/su-1/api' : '/api';
    return pathPrefix;
  }
  return '/api';
}

export async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const raw = await res.text();
  let data = {};
  try { data = raw ? JSON.parse(raw) : {}; } catch (e) {
    throw new Error(`Invalid JSON from ${url}`);
  }
  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}
