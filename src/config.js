export const API_BASE_URL = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD
    ? 'https://hotelmanagementsystem-production-4857.up.railway.app'
    : 'http://localhost:5000')
).replace(/\/+$/, '');
