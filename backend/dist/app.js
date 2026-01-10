import express from 'express';
import cors from 'cors'; // YOUR CORS ✅
import authRoute from './router/authenticationRoute.js'; // YOUR auth
import cookieParser from 'cookie-parser';
import { errorHandler } from './middlewares/errorHandler.js';
import { requestLogger } from './middlewares/requestLogger.js';
import mainRoute from './router/mainRoute.js'; // FRIEND'S routes
const app = express();
// CORS - YOUR FIX (before all routes)
app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());
app.use(cookieParser());
app.use(requestLogger);
app.get('/', (_req, res) => {
    res.send('hello world');
});
// BOTH ROUTES - /api/auth + /api/v1/*
app.use('/api/auth', authRoute); // Login/signup
app.use('/api/v1', mainRoute); // Friend's CTF routes
app.use(errorHandler);
export default app;
//# sourceMappingURL=app.js.map