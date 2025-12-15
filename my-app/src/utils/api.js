export function apiBase() {
  // Vite → exposed to browser
  const envBase = import.meta.env.VITE_API_BASE_URL;

  // If env is set (production), always use it
  if (envBase) {
    return envBase.replace(/\/$/, ''); // trim trailing slash
  }

  // Local fallback
  return 'http://localhost:4000';
}

export async function fetchJSON(url, opts = {}) {
  const res = await fetch(url, opts);
  const raw = await res.text();

  let data = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`Invalid JSON from ${url}`);
  }

  if (!res.ok || data.success === false) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }

  return data;
}


