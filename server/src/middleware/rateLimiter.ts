import rateLimit from 'express-rate-limit';

export const apiRateLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100,
	message: 'API rate limit reached. Please try again in 15 minutes.',
});

export const shortenUrlRateLimiter = rateLimit({
	windowMs: 60 * 60 * 1000, // 1 hour
	max: 25,
	message: 'URL shortening rate limit reached. Please try again in an hour.',
});
export const redirectUrlRateLimiter = rateLimit({
	windowMs: 1000 * 60 * 1, // 1 minute
	max: 50,
	message: 'Too many redirect requests, please try again in 1 minute.',
});

// NOTE: Ideally would have specific scenario rate limiting if time allowed
export const authLimiter = rateLimit(); // strict
export const passwordReset = rateLimit(); // stricter
