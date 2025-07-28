import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import prisma from '../lib/prisma';
import { User } from '@prisma/client';
import {
	createSafeUserData,
	areCredentialsValid,
	signJwtToken,
} from '../utils/auth';
import {
	sendValidationError,
	sendConflictError,
	sendInternalServerError,
	sendUnauthorizedError,
} from '../utils/error';

export const signup = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const validationError = areCredentialsValid(email, password);

		if (validationError) {
			return sendValidationError(res, validationError);
		}
		console.log('credentials valid');

		const existingUser = await prisma.user.findUnique({
			where: { email },
		});
		if (existingUser) {
			return sendConflictError(res, 'User with this email already exists');
		}

		const hashedPassword = await bcrypt.hash(password, 12);
		const user: Pick<User, 'id' | 'email'> = await prisma.user.create({
			data: { email, password_hash: hashedPassword },
			select: { id: true, email: true },
		});

		const userSafeData = createSafeUserData(user);
		const token = signJwtToken(userSafeData);

		res.status(201).json({
			token,
			user: userSafeData,
		});
	} catch (err) {
		console.error('Login error:', err);

		sendInternalServerError(res, 'Failed to create account');
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { email, password } = req.body;
		const validationError = areCredentialsValid(email, password);

		if (validationError) {
			return sendValidationError(res, validationError);
		}

		const user: User | null = await prisma.user.findUnique({
			where: { email },
		});
		if (!user) {
			return sendUnauthorizedError(res);
		}

		const isValidPassword = await bcrypt.compare(password, user.password_hash);
		if (!isValidPassword) {
			return sendUnauthorizedError(res);
		}

		const userSafeData = createSafeUserData(user);
		const token = signJwtToken(userSafeData);

		res.json({
			token,
			user: userSafeData,
		});
	} catch (err) {
		console.error('Login error:', err);

		sendInternalServerError(res, 'Failed to login');
	}
};

// NOTE: logout is handled client side since we're using jwt stateless (time save)
