import express from 'express';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import mainRoute from './router/mainRoute.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

app.get('/', (_req, res) => {
  res.send('hello world');
});

app.use('/api/v1', mainRoute);

app.use(errorHandler);

export default app;
