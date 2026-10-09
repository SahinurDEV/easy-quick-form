// Test configuration — set before the app is imported so env validation passes
// and no real Google calls are made.
process.env.NODE_ENV = 'test';
process.env.ACCESS_TOKEN_SECRET = 'test-access-secret';
process.env.REFRESH_TOKEN_SECRET = 'test-refresh-secret';
process.env.DATABASE = 'mongodb://127.0.0.1/test';
process.env.GOOGLE_CLIENT_ID = '';
process.env.GOOGLE_CLIENT_SECRET = '';
process.env.IMGBB_API_KEY = '';
process.env.CLIENT_URL = 'https://app.example.com';

import { beforeAll, afterAll, afterEach } from 'vitest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongod: MongoMemoryServer;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
});

afterEach(async () => {
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map(collection => collection.deleteMany({})),
  );
});

afterAll(async () => {
  // Test files share one process; drop compiled models so the next file can
  // register them again.
  mongoose.deleteModel(/.+/);
  await mongoose.disconnect();
  await mongod.stop();
});
