// Import env first: it loads .env and validates the configuration before any
// other module reads process.env.
import { env } from './utils/env';
import app from './app';
import logger from './utils/logger';
import { connectDB } from './utils/db';

process.on('uncaughtException', err => {
  logger.fatal(err, 'Uncaught exception — shutting down');
  process.exit(1);
});

connectDB()
  .then(() => logger.info('DB connection successful!'))
  .catch(err => logger.error(err, 'DB connection failed!'));

const server = app.listen(env.PORT, () => {
  logger.info(`Server is listening on port ${env.PORT}...`);
});

process.on('unhandledRejection', (err: unknown) => {
  if (err instanceof Error) logger.error(err, 'Unhandled rejection — shutting down');
  server.close(() => {
    process.exit(1);
  });
});
