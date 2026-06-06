/**
 * Resolves the URL for a static asset, prepending the Frappe assets directory prefix
 * if the app is served from a Frappe site.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }
  
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  
  // In production (non-localhost), static assets are always served from the Frappe assets directory
  const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  if (!isLocalhost) {
    return `/assets/courts_storefront/dist/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
}
