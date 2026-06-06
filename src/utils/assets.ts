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
  
  // Under Frappe, the app is served on a path starting with /courts,
  // and static assets are located under the /assets/courts_storefront/dist/ directory.
  const isFrappe = window.location.pathname.startsWith('/courts');
  if (isFrappe) {
    return `/assets/courts_storefront/dist/${cleanPath}`;
  }
  
  return `/${cleanPath}`;
}
