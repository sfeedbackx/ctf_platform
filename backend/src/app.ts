import express from 'express';
import authRoute from './router/authenticationRoute.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.get('/', (_req, res) => {
  res.send('hello world');
});

app.use('/api', authRoute);
// Global error handler (should be after routes)
app.use(errorHandler);

export default app;
