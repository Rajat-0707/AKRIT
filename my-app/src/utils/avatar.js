
export const DEFAULT_AVATAR_SVG = `data:image/svg+xml;utf8,
<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
  <circle cx='64' cy='64' r='64' fill='%234b5563'/>
  <circle cx='64' cy='44' r='22' fill='%23e5e7eb'/>
  <path d='M16 112c0-26.5 21.5-48 48-48s48 21.5 48 48' fill='%23e5e7eb'/>
</svg>`;

/* ──────────────────────────────────────────────
   Initials-based gradient avatar system
   ────────────────────────────────────────────── */

const GRADIENT_PAIRS = [
  ['#6366f1', '#8b5cf6'], // indigo → violet
  ['#0ea5e9', '#06b6d4'], // sky → cyan
  ['#f43f5e', '#ec4899'], // rose → pink
  ['#f59e0b', '#f97316'], // amber → orange
  ['#10b981', '#14b8a6'], // emerald → teal
  ['#8b5cf6', '#a855f7'], // violet → purple
  ['#3b82f6', '#6366f1'], // blue → indigo
  ['#ef4444', '#f43f5e'], // red → rose
];

/**
 * Extract initials from a name (max 2 characters).
 */
export function getInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return parts[0].substring(0, 2).toUpperCase();
}

/**
 * Hash a string into a consistent index for gradient selection.
 */
function hashName(name) {
  let hash = 0;
  const str = (name || '').toLowerCase();
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0; // Convert to 32-bit int
  }
  return Math.abs(hash);
}

/**
 * Get a consistent gradient pair for a name.
 */
export function getAvatarGradient(name) {
  const idx = hashName(name) % GRADIENT_PAIRS.length;
  return GRADIENT_PAIRS[idx];
}

/**
 * Generate an SVG data URI with the artist's initials on a gradient background.
 */
export function getInitialsAvatarSVG(name) {
  const initials = getInitials(name);
  const [c1, c2] = getAvatarGradient(name);
  // Encode for use in data URI
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 128 128'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='${c1}'/>
      <stop offset='100%' stop-color='${c2}'/>
    </linearGradient>
  </defs>
  <rect width='128' height='128' rx='64' fill='url(%23g)'/>
  <text x='64' y='64' dy='.35em' text-anchor='middle'
        font-family='Inter,system-ui,sans-serif' font-weight='700'
        font-size='48' fill='white'>${initials}</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Smart avatar source: returns image URL if valid, otherwise generates initials avatar.
 * @param {object} artist - Artist object with potential img/img_url/name fields.
 * @returns {string} Image source URL or data URI.
 */
export function getAvatarSrc(artist) {
  if (!artist) return DEFAULT_AVATAR_SVG;
  const img = artist.img || artist.img_url;
  // If there's a real image URL (not the default placeholder paths), use it
  if (img && img.trim() && !img.includes('avt.png') && !img.includes('profile.png')) {
    return img;
  }
  // Generate initials avatar from name
  if (artist.name) {
    return getInitialsAvatarSVG(artist.name);
  }
  return DEFAULT_AVATAR_SVG;
}
