import { toast } from 'react-hot-toast/headless';

export const isValidUrl = (string: string) => {
	try {
		new URL(string.startsWith('http') ? string : `https://${string}`);
		return true;
	} catch {
		toast.error(
			'Please enter a valid URL (e.g., example.com or https://example.com)'
		);
		return false;
	}
};
