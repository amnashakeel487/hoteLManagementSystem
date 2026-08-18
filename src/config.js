const cleanUrl = (url) => {
  if (!url) return 'https://hotelmanagementsystem-production-4857.up.railway.app';
  let cleaned = url.trim().replace(/[\s\t\n]+/g, '-').replace(/\/+$/, '');
  if (!/^https?:\/\//i.test(cleaned)) {
    cleaned = `https://${cleaned}`;
  }
  return cleaned;
};

const rawUrl = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://hotelmanagementsystem-production-4857.up.railway.app'
    : 'http://localhost:5000')
);

export const API_BASE_URL = cleanUrl(rawUrl);

export const ADMIN_ROUTE_PATH = '/portal-x7k2-admin';
