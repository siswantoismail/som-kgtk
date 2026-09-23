/**
 * SIM-SOP GTK API Configuration
 * Supports hybrid deployment:
 * - Frontend on Vercel: VITE_API_URL (e.g., https://your-app.up.railway.app)
 * - Vercel proxy rewrite: relative '/api/...'
 * - Local development: relative '/api/...'
 */

// Reads base URL from environment variables, fallback to empty string (relative)
export const getApiBaseUrl = (): string => {
  const envUrl = 
    (import.meta as any).env?.VITE_API_URL || 
    (import.meta as any).env?.VITE_BACKEND_URL || 
    '';
  return envUrl ? envUrl.replace(/\/+$/, '') : '';
};

/**
 * Returns full URL for an API endpoint.
 * Example:
 * apiUrl('/api/auth/login') -> 'https://your-app.up.railway.app/api/auth/login' (if VITE_API_URL is set)
 * apiUrl('/api/auth/login') -> '/api/auth/login' (if local / using Vercel rewrites)
 */
export const apiUrl = (endpoint: string): string => {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = getApiBaseUrl();
  return baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;
};
