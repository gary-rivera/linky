import { Request, Response } from 'express';
import { validateUrl, generateUniqueSlug } from '../utils/url';
import {
	handlePrismaError,
	sendValidationError,
	sendForbiddenError,
	sendNotFoundError,
	sendConflictError,
} from '../utils/error';
import prisma from '../lib/prisma';
import { buildShortenedUrl } from '../utils/url';

interface ShortenUrlPayload {
	url: string;
}

interface ModifyUrlPayload {
	newSlug: string;
}

export const createShortenedUrl = async (req: Request, res: Response) => {
	console.log('Received request to create shortened URL:', req.body);

	try {
		const { url }: ShortenUrlPayload = req.body;

		if (!url || typeof url !== 'string') {
			return sendValidationError(res, 'URL is required');
		}

		const validation = await validateUrl(url);
		if (!validation.isValid) {
			return sendValidationError(res, 'Invalid URL format');
		}

		const userId = req.user?.id || null;
		console.log('User ID from request:', userId);
		// avoid dupes of url for same user
		if (userId) {
			console.log('Checking if URL exists for user:', userId);
			const existingUrl = await prisma.shortenedUrl.findFirst({
				where: {
					original_url: validation.finalUrl!,
					user_id: userId,
				},
			});

			if (existingUrl) {
				console.log(
					'URL already exists for user. Returning existing URL:',
					existingUrl
				);
				return res.status(409).json({
					id: existingUrl.id,
					original_url: existingUrl.original_url,
					slug: existingUrl.slug,
					shortened_url: buildShortenedUrl(req, existingUrl.slug),
					created_at: existingUrl.created_at,
					is_reachable: validation.isReachable,
					message: 'URL already exists for this user',
				});
			}
		}

		const slug = await generateUniqueSlug();

		const shortenedUrl = await prisma.shortenedUrl.create({
			data: {
				original_url: validation.finalUrl!,
				slug,
				user_id: userId ?? undefined,
			},
		});

		return res.status(201).json({
			id: shortenedUrl.id,
			user_id: shortenedUrl.user_id,
			original_url: shortenedUrl.original_url,
			slug: shortenedUrl.slug,
			shortened_url: buildShortenedUrl(req, slug),
			created_at: shortenedUrl.created_at,
			is_reachable: validation.isReachable,
		});
	} catch (error) {
		console.error('Error creating shortened URL:', error);

		return handlePrismaError(error, res);
	}
};

export const updateSlug = async (req: Request, res: Response) => {
	try {
		const { shortened_url_id } = req.params;
		const shortenedUrlId = parseInt(shortened_url_id, 10);
		const { newSlug }: ModifyUrlPayload = req.body;
		const userId = req.user?.id;

		console.log('Received request to update slug:', {
			shortenedUrlId,
			newSlug,
			userId,
		});

		if (!userId) {
			return sendForbiddenError(res, 'Must be logged in to update slug');
		}

		if (!newSlug) {
			return sendValidationError(res, 'Missing or invalid new slug');
		}

		// Basic slug validation (alphanumeric + hyphens/underscores, reasonable length)
		const slugPattern = /^[a-zA-Z0-9_-]{1,25}$/;
		if (typeof newSlug !== 'string' || !slugPattern.test(newSlug)) {
			return sendValidationError(res, 'Invalid slug format');
		}

		// Find the shortened URL that belongs to this user
		const existingUrl = await prisma.shortenedUrl.findFirst({
			where: {
				id: shortenedUrlId,
				user_id: userId,
			},
		});

		if (!existingUrl) {
			return sendNotFoundError(res, 'Shortened URL');
		}

		// Check if the new slug is already taken (by any user)
		const slugExists = await prisma.shortenedUrl.findUnique({
			where: { slug: newSlug },
		});

		if (slugExists && slugExists.id !== existingUrl.id) {
			return sendConflictError(
				res,
				'Slug already exists, please choose another',
				slugExists
			);
		}

		// If the new slug is the same as the current one, no need to update
		if (existingUrl.slug === newSlug) {
			return res.status(200).json({
				id: existingUrl.id,
				original_url: existingUrl.original_url,
				slug: existingUrl.slug,
				shortened_url: buildShortenedUrl(req, existingUrl.slug),
				created_at: existingUrl.created_at,
				updated_at: existingUrl.updated_at,
				slug_unchanged: true,
			});
		}

		// Update the slug
		const updatedUrl = await prisma.shortenedUrl.update({
			where: { id: existingUrl.id },
			data: {
				slug: newSlug,
				updated_at: new Date(),
			},
		});

		return res.status(200).json({
			id: updatedUrl.id,
			original_url: updatedUrl.original_url,
			slug: updatedUrl.slug,
			shortened_url: buildShortenedUrl(req, updatedUrl.slug),
			created_at: updatedUrl.created_at,
			updated_at: updatedUrl.updated_at,
			message: 'Slug updated successfully',
		});
	} catch (error) {
		console.error('Error updating slug:', error);
		return handlePrismaError(error, res);
	}
};
