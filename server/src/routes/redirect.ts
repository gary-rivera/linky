import { Router } from 'express';
import { redirectToOriginalUrl } from '../controllers/redirect';

const redirectRouter = Router();

redirectRouter.get('/', (req, res) => {
	res.json({ message: 'URL Shortener API', status: 'running' });
});

redirectRouter.get('/:slug', redirectToOriginalUrl);

export { redirectRouter };
