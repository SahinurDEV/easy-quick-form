import type { CookieOptions } from 'express';

export const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:4173',
  'http://localhost:4400',
  'https://easyformbuilder.netlify.app',
  'https://eqf.sobhoy.com',
  // Deployed frontend URL — set the CLIENT_URL env var to your production origin.
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

export const accessTokenExpiresIn = '1h';
export const refreshTokenExpiresIn = '7d';

export const cookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

export const clearCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'none',
  secure: true,
  path: '/',
};
