import { STORE_CONFIG } from '../config/store.config';

const cleanBaseUrl = STORE_CONFIG.erpnextUrl.endsWith('/')
  ? STORE_CONFIG.erpnextUrl.slice(0, -1)
  : STORE_CONFIG.erpnextUrl;

export const resolveErpnextUrl = (path?: string | null): string => {
  if (!path) return '';
  if (/^(https?:|data:|blob:)/i.test(path)) return path;
  if (path.startsWith('//')) return path;
  if (path.startsWith('/')) return `${cleanBaseUrl}${path}`;
  return `${cleanBaseUrl}/${path.replace(/^\/+/, '')}`;
};

export const getInitials = (name?: string | null): string => {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 1).toUpperCase();

  return `${parts[0].slice(0, 1)}${parts[parts.length - 1].slice(0, 1)}`.toUpperCase();
};
