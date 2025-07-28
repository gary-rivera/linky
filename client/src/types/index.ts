export interface ApiErrorResponse {
	error: string;
	details?: string;
	resource?: ShortenUrlSuccessResponse;
}

interface BaseUrl {
	id: number;
	original_url: string;
	slug: string;
	shortened_url: string;
	created_at: string;
	visit_count: number;
}

export interface ShortenUrlSuccessResponse extends BaseUrl {
	user_id?: number | null;
	updated_at?: string;
	is_reachable?: boolean;
}

export interface UserUrl extends BaseUrl {
	updated_at: string;
}

export interface ModifyUrlSuccessResponse extends ShortenUrlSuccessResponse {
	slug_unchanged: boolean;
}

export interface FetchUrlsSuccessResponse {
	urls: UserUrl[];
	count: number;
	sortBy: 'popularity' | 'created_at';
}

export type ShortenUrlResponse = ShortenUrlSuccessResponse | ApiErrorResponse;
export type ModifyUrlResponse = ModifyUrlSuccessResponse | ApiErrorResponse;
export type FetchUrlsResponse = FetchUrlsSuccessResponse | ApiErrorResponse;
