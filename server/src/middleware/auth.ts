import { Request, Response, NextFunction } from 'express';
import { decodeJwtToken, UserSessionData } from '../utils/auth';
import jwt from 'jsonwebtoken';

// NOTE: req.user === undefined just means an anon user. shoudl still be able to shorten urls

export const authOptional = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	const token = req.headers.authorization?.replace('Bearer ', '');

	if (!token) {
		req.user = undefined;
		return next();
	}

	try {
		const decoded: UserSessionData | null = decodeJwtToken(token);

		if (!decoded) {
			req.user = undefined;
			return next();
		}
		req.user = {
			id: decoded.id,
			email: decoded.email,
		};

		return next();
	} catch (error) {
		req.user = undefined;
		return next();
	}
};

export const authRequired = (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	if (!req.user) {
		return res
			.status(401)
			.json({ error: 'Authentication required for this action' });
	}

	next();
};
