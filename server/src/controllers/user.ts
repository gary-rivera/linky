import { Request, Response } from 'express';
import { handlePrismaError, sendUnauthorizedError } from '../utils/error';
import prisma from '../lib/prisma';
import { buildShortenedUrl } from '../utils/url';

export const getUserUrls = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;
		const sort = req.query.sort as string;

		console.log(
			'Received request to get URLs for user:',
			userId,
			'sort:',
			sort
		);

		if (!userId) {
			return sendUnauthorizedError(res, 'Authentication required to view URLs');
		}

		let orderBy;
		if (sort === 'popularity') {
			orderBy = {
				visit_count: 'desc' as const,
			};
		} else {
			orderBy = {
				created_at: 'desc' as const,
			};
		}

		const userUrls = await prisma.shortenedUrl.findMany({
			where: {
				user_id: userId,
			},
			orderBy,
		});

		console.log(`Found ${userUrls.length} URLs for user ${userId}`);

		const urlsWithShortenedUrl = userUrls.map((url) => ({
			id: url.id,
			original_url: url.original_url,
			slug: url.slug,
			shortened_url: buildShortenedUrl(req, url.slug),
			visit_count: url.visit_count,
			created_at: url.created_at,
			updated_at: url.updated_at,
		}));

		return res.status(200).json({
			urls: urlsWithShortenedUrl,
			count: userUrls.length,
			sortBy: sort || 'created_at',
		});
	} catch (err) {
		console.error('Error fetching user URLs:', err);

		return handlePrismaError(err, res);
	}
};
