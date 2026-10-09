import rateLimit from 'express-rate-limit';
import type { RequestHandler } from 'express';
import logger from '../utils/logger';
import { env } from '../utils/env';

const createLimiter = (
  windowMs: number,
  max: number,
  message: string,
): RequestHandler => {
  // Disable rate limiting in tests so suites aren't throttled.
  if (env.NODE_ENV === 'test') return (_req, _res, next) => next();

  return rateLimit({
    windowMs,
    max,
    message: { message },
    handler: (req, res, _next, options) => {
      logger.warn(
        { method: req.method, url: req.url, ip: req.ip },
        `Rate limit exceeded: ${(options.message as { message: string }).message}`,
      );
      res.status(options.statusCode).send(options.message);
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
};

// 5 sign-in attempts per minute per IP.
export const loginLimiter = createLimiter(
  60 * 1000,
  5,
  'Too many login attempts from this IP, please try again in a minute!',
);
