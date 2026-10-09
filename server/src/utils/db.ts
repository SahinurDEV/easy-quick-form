import mongoose from 'mongoose';
import { env } from './env';

// Cache the connection promise on globalThis so serverless invocations that
// reuse a warm instance (e.g. on Vercel) don't open a new connection each time.
const globalForMongoose = globalThis as unknown as {
  mongooseConn?: Promise<typeof mongoose>;
};

export const connectDB = (): Promise<typeof mongoose> => {
  if (!globalForMongoose.mongooseConn) {
    globalForMongoose.mongooseConn = mongoose
      .connect(env.DATABASE, { serverSelectionTimeoutMS: 10000 })
      .catch(err => {
        // Allow the next request to retry instead of caching the failure.
        globalForMongoose.mongooseConn = undefined;
        throw err;
      });
  }
  return globalForMongoose.mongooseConn;
};
