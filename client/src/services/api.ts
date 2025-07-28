import axios from 'axios';
import type {
	ApiErrorResponse,
	ShortenUrlSuccessResponse,
	FetchUrlsSuccessResponse,
	UserUrl,
} from '../types';

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_URL || '/api',
	headers: {
		'Content-Type': 'application/json',
	},
});

export const fetchUserUrls = async (
	setLoading: (loading: boolean) => void,
	setError: (error: string | null) => void,
	setUrls: (urls: UserUrl[]) => void
) => {
	setLoading(true);
	setError(null);

	try {
		const response = await api.get('/user/urls', {
			params: { sort: 'popularity' },
		});
		console.log('Dashboard: Fetched URLs:', response.data);

		const urlsData = response.data as FetchUrlsSuccessResponse;
		setUrls(urlsData.urls as UserUrl[]);
	} catch {
		setError('Failed to load your URLs');
	} finally {
		setLoading(false);
	}
};

export class ApiError extends Error {
	public status: number;
	public details?: string;
	public resource?: ShortenUrlSuccessResponse;

	constructor(
		message: string,
		status: number,
		details?: string,
		resource?: ShortenUrlSuccessResponse
	) {
		super(message);
		this.name = 'ApiError';
		this.status = status;
		this.details = details;
		this.resource = resource;
	}
}
export const handleApiError = (error: unknown): never => {
	console.error('API Error:', error);

	if (axios.isAxiosError(error)) {
		const status = error.response?.status || 500;
		const errorData = error.response?.data as ApiErrorResponse;

		const message =
			errorData?.error || error.message || 'An unexpected error occurred';
		const details = errorData?.details;

		switch (status) {
			case 400:
				throw new ApiError(`Validation Error: ${message}`, status, details);
			case 401:
				throw new ApiError(`Authentication Error: ${message}`, status, details);
			case 403:
				throw new ApiError(`Access Denied: ${message}`, status, details);
			case 404:
				throw new ApiError(`Not Found: ${message}`, status, details);
			case 409:
				throw new ApiError(
					`Conflict: ${message}`,
					status,
					details,
					errorData as unknown as ShortenUrlSuccessResponse
				);
			case 422:
				throw new ApiError(`Validation Error: ${message}`, status, details);
			case 429:
				throw new ApiError(
					'Too many requests. Please try again later.',
					status,
					details
				);
			case 500:
				throw new ApiError(`Server Error: ${message}`, status, details);
			case 503:
				throw new ApiError(
					'Service temporarily unavailable. Please try again later.',
					status,
					details
				);
			default:
				throw new ApiError(message, status, details);
		}
	}

	if (error instanceof Error) {
		if (
			error.message.includes('Network Error') ||
			error.message.includes('ERR_NETWORK')
		) {
			throw new ApiError(
				'Network connection failed. Please check your internet connection.',
				0
			);
		}
		throw new ApiError(error.message, 500);
	}

	throw new ApiError('An unexpected error occurred', 500);
};
