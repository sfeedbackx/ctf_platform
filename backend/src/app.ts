import express from 'express';
import cors from 'cors';  // ADD THIS
import authRoute from './router/authenticationRoute.js';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';

const app = express();

// CORS - ADD THIS BLOCK (before routes)
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],  // Frontend Vite ports
  credentials: true,  // For cookies/JWT
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));

app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);

// Routes
app.get('/', (_req, res) => {
  res.send('hello world');
});

app.use('/api', authRoute);  // Your auth routes at /api/login

// Global error handler
app.use(errorHandler);

export default app;
