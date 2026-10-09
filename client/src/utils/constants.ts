export const BACKEND_BASE_URL = import.meta.env.VITE_BACKEND_BASE_URL;
export const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
// Google sign-in is shown only when a Google OAuth client ID is configured.
export const GOOGLE_CLIENT_ID: string | undefined =
  import.meta.env.VITE_GOOGLE_CLIENT_ID || undefined;

export const cookieMaxAge = 60 * 60 * 24 * 7; // 7 days
