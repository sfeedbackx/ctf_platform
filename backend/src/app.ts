import express from 'express';
import cors from 'cors';
import authRoute from './router/authenticationRoute.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import mainRoute from './router/mainRoute.js';
import { apiLimiter } from './utils/rateLimitUtils.js';

const app = express();

// CORS configuration
app.use(
  cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.send('hello world');
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/v1', apiLimiter, mainRoute);

// Error handler (must be last)
app.use(errorHandler);

export default app;
