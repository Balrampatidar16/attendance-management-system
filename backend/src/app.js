import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import morgan from 'morgan';
import { env } from './config/env.js';
import logger from './config/logger.js';
import routerV1 from './routes/index.js';
import notFound from './middlewares/notFound.middleware.js';
import errorMiddleware from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(compression());

// selfies arrive as base64 data URLs, so the JSON body limit is raised beyond the express default
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

const morganStream = { write: (message) => logger.http(message.trim()) };
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined', { stream: morganStream }));

app.use('/api/v1', routerV1);

app.use(notFound);
app.use(errorMiddleware);

export default app;
