import { Request, Response } from 'express';
import { sendInternalServerError, sendValidationError } from '../utils/error';
import { getClientIP } from '../utils/ip';
import { isValidUrlFormat } from '../utils/url';
import prisma from '../lib/prisma';
import path from 'path';

export const redirectToOriginalUrl = async (req: Request, res: Response) => {
	try {
		console.log('[Linky] Starting redirect ...');
		const { slug } = req.params;

		if (!slug || typeof slug !== 'string' || !slug.length) {
			return sendValidationError(res, 'Invalid slug received');
		}

		// Find the shortened URL by slug
		const shortenedUrl = await prisma.shortenedUrl.findUnique({
			where: { slug },
		});

		if (!shortenedUrl || !shortenedUrl.is_active) {
			console.warn('[Linky] Slug not found or URL is inactive:', slug);

			return res
				.status(404)
				.sendFile(path.join(process.cwd(), 'public/404.html'));
		}

		const isValidUrlForRedirect = isValidUrlFormat(
			shortenedUrl?.original_url,
			true
		);

		if (!isValidUrlForRedirect) {
			console.warn(
				'[Linky] Invalid URL format for redirect:',
				shortenedUrl.original_url
			);
			return res
				.status(404)
				.sendFile(path.join(process.cwd(), 'public/404.html'));
		}

		console.log('[Linky] Found active, valid shortened URL:', shortenedUrl);

		const userAgent = req.get('User-Agent') || '';
		const isClientRequest = req.query.client === 'true';
		const ipAddress = getClientIP(req);

		if (!isClientRequest) {
			console.log('[Linky] Logging visit for slug:', slug);

			await prisma.$transaction([
				prisma.visit.create({
					data: {
						shortened_url_id: shortenedUrl.id,
						ip_address: ipAddress,
						user_agent: userAgent,
					},
				}),

				prisma.shortenedUrl.update({
					where: { id: shortenedUrl.id },
					data: {
						visit_count: {
							increment: 1,
						},
					},
				}),
			]);
		}

		console.log(
			'[Linky] Transaction completed successfully, redirecting to original URL:',
			shortenedUrl.original_url
		);

		return res.redirect(301, shortenedUrl.original_url);
	} catch (error) {
		console.error('Error redirecting to original URL:', error);
		return sendInternalServerError(res);
	}
};
