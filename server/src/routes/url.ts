import { Router } from 'express';
import { authRequired } from '../middleware/auth';
import {
	createShortenedUrl as shortenUrlController,
	updateSlug as updateSlugController,
} from '../controllers/url';

const urlRouter = Router();

urlRouter.post('/shorten', shortenUrlController);
urlRouter.patch(
	'/modify/:shortened_url_id',
	authRequired,
	updateSlugController
);

export { urlRouter };
