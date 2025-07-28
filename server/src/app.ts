import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';

import {
	healthRouter,
	authRouter,
	urlRouter,
	redirectRouter,
	userRouter,
} from './routes';
import {
	apiRateLimiter,
	redirectUrlRateLimiter,
	authOptional,
	authRequired,
} from './middleware';

import { sendNotFoundError } from './utils/error';

const app = express();
app.use(express.static(path.join(__dirname, '../../client/dist')));
app.use(express.static('public'));
app.use(express.json());

app.use(helmet());
app.use(cors());

app.set('trust proxy', ['loopback', 'linklocal', 'uniquelocal']);

app.use('/health', healthRouter);

app.use('/api', apiRateLimiter);

app.use('/api/auth', authRouter);
app.use('/api/user', authOptional, authRequired, userRouter);
app.use('/api/url', authOptional, urlRouter);

app.use('/api', (req, res) => {
	if (req.path === '/') {
		return res.json({ message: 'API base path - use specific endpoints' });
	}
	return sendNotFoundError(res, 'API endpoint');
});

app.use('/r', redirectUrlRateLimiter, redirectRouter);

export default app;
