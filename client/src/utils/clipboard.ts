import toast from 'react-hot-toast';

export const copyUrlToClipboard = async (
	url: string,
	setCopied?: React.Dispatch<React.SetStateAction<boolean>>
): Promise<void> => {
	if (!url) return;

	try {
		await navigator.clipboard.writeText(url);
		if (setCopied) {
			setCopied(true);
			setTimeout(() => setCopied(false), 3000);
		}
		toast.success('URL copied to clipboard!');
	} catch (error) {
		if (setCopied) {
			setCopied(false);
		}
		console.error('Failed to copy URL:', error);
		toast.error('Failed to copy URL');
	}
};
