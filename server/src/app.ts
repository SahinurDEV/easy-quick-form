import express, { Application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';

import swaggerUi from 'swagger-ui-express';

import authRouter from './routes/authRoutes';
import userRouter from './routes/userRoutes';
import formRouter from './routes/formRoutes';
import AppError from './utils/appError';
import { globalErrorHandler } from './controllers/errorController';
import verifyJWT from './middleware/verifyJWT';
import { allowedOrigins } from './utils/constants';
import credentials from './middleware/credentials';
import httpLogger from './middleware/logger';
import openapiSpec from './docs/openapi';

const app: Application = express();

// Behind Vercel's (or any single) reverse proxy, trust the first hop so
// req.ip / rate limiting use the real client IP instead of the proxy's.
if (process.env.VERCEL || process.env.TRUST_PROXY) app.set('trust proxy', 1);

// Interactive API docs — mounted before helmet so its CSP doesn't block the
// Swagger UI assets.
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  }),
);

app.use(httpLogger);

app.use(credentials);
app.use(cors({ origin: allowedOrigins }));

app.use(express.static('public'));
app.use(cookieParser());
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

app.use(hpp());
// testing route
app.get(['/', '/test'], (req, res) => {
  res.send({ message: 'This is Easy Quick Form API', userIP: req.ip });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/forms', formRouter);
app.use(verifyJWT);
app.use('/api/v1/user', userRouter);

app.all('*', (req, _res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
