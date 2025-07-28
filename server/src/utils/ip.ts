import { Request } from 'express';

export const getClientIP = (req: Request) => {
	// req.ip is the best option when trust proxy is set
	let ip = req.ip;

	// Fallback to x-forwarded-for header
	if (!ip || ip === '::1' || ip === '127.0.0.1') {
		const xForwardedFor = req.headers['x-forwarded-for'];
		if (xForwardedFor) {
			// x-forwarded-for can be "client, proxy1, proxy2"
			ip = Array.isArray(xForwardedFor)
				? xForwardedFor[0]
				: xForwardedFor.split(',')[0].trim();
		}
	}

	if (!ip || ip === '::1' || ip === '127.0.0.1') {
		ip =
			req.connection?.remoteAddress || req.socket?.remoteAddress || 'unknown';
	}

	if (ip === '::1') {
		ip = '127.0.0.1';
	}

	return ip;
};
