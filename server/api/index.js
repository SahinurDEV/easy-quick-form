// Vercel serverless entry point. `pnpm run vercel-build` compiles src/ to
// dist/ first; this handler reuses the Express app (no app.listen) and a
// cached MongoDB connection across warm invocations.
require('../dist/utils/env');
const app = require('../dist/app').default;
const { connectDB } = require('../dist/utils/db');
const logger = require('../dist/utils/logger').default;

module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(err, 'DB connection failed!');
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json');
    res.end(
      JSON.stringify({ status: 'error', message: 'Database unavailable' }),
    );
    return;
  }
  return app(req, res);
};
