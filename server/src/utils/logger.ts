import pino from 'pino';
import { env } from './env';

// Structured, leveled logger. Pretty-printed in development, JSON in
// production (works with any log aggregator), silent during tests.
const logger = pino({
  // Never write credentials (tokens, cookies) to the logs.
  redact: [
    'req.headers.authorization',
    'req.headers.cookie',
    'res.headers["set-cookie"]',
  ],
  level:
    env.NODE_ENV === 'test'
      ? 'silent'
      : env.NODE_ENV === 'production'
        ? 'info'
        : 'debug',
  transport:
    env.NODE_ENV === 'development'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
});

export default logger;
