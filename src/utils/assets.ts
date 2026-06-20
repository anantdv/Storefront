/**
 * Resolves the URL for a static asset.
 *
 * By default this points at the app's public root so Vercel can serve
 * `/logo.png`, `/hero.png`, and similar files correctly.
 *
 * If you deploy inside Frappe and need the old app-specific asset prefix,
 * set `VITE_STATIC_ASSET_BASE=/assets/courts_storefront/dist` at build time.
 */
export function getAssetUrl(path: string): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const cleanPath = path.startsWith('/') ? path.slice(1) : path;

  const assetBase = import.meta.env.VITE_STATIC_ASSET_BASE?.trim();
  if (assetBase) {
    return `${assetBase.replace(/\/$/, '')}/${cleanPath}`;
  }

  return `/${cleanPath}`;
}
