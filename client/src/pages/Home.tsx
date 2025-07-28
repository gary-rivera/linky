import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import { fetchUserUrls } from '../services/api';

import UrlManager from '../components/UrlManager';
import Dashboard from '../components/Dashboard';
import type { ShortenUrlSuccessResponse, UserUrl } from '../types';

export default function Home() {
	const { user } = useAuth();

	const [searchParams, setSearchParams] = useSearchParams();
	const [currentShortenedUrl, setCurrentShortenedUrl] =
		useState<ShortenUrlSuccessResponse | null>(null);
	const [readyToRender, setReadyToRender] = useState(false);
	const [urls, setUrls] = useState<UserUrl[]>([]);

	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!user) return;

		fetchUserUrls(setLoading, setError, setUrls);
	}, [user]);

	useEffect(() => {
		const urlData = searchParams.get('shortened');

		if (urlData) {
			try {
				const parsedData = JSON.parse(decodeURIComponent(urlData));
				setCurrentShortenedUrl(parsedData);
			} catch (error) {
				console.error('Failed to parse shortened URL data from params:', error);
				setSearchParams((prev) => {
					const newParams = new URLSearchParams(prev);
					newParams.delete('shortened');
					return newParams;
				});
			}
		} else {
			console.log('No shortened URL data in search params');
		}

		setReadyToRender(true);
	}, [searchParams, setSearchParams]);

	const handleShortenedUrlChange = (
		shortenedUrl: ShortenUrlSuccessResponse | null
	) => {
		setCurrentShortenedUrl(shortenedUrl);

		if (shortenedUrl) {
			setSearchParams((prev) => {
				const newParams = new URLSearchParams(prev);
				const encodedData = encodeURIComponent(JSON.stringify(shortenedUrl));

				newParams.set('shortened', encodedData);
				return newParams;
			});
			if (user) {
				console.log(
					'Shortened URL updated with user present. Fetching URLs...'
				);
				fetchUserUrls(setLoading, setError, setUrls);
			}
		} else {
			setSearchParams((prev) => {
				const newParams = new URLSearchParams(prev);
				newParams.delete('shortened');
				return newParams;
			});
		}
	};

	const handleUrlCardClick = (url: UserUrl) => {
		const shortenedUrlData: ShortenUrlSuccessResponse = {
			id: url.id,
			original_url: url.original_url,
			slug: url.slug,
			shortened_url: `${window.location.origin}/${url.slug}`, // Construct full short URL
			visit_count: url.visit_count,
			created_at: url.created_at,
		};

		handleShortenedUrlChange(shortenedUrlData);
	};

	return (
		<div className="container mx-auto px-4 py-16">
			{readyToRender ? (
				<>
					<UrlManager
						persistedShortenedUrl={currentShortenedUrl}
						onShortenedUrlChange={handleShortenedUrlChange}
					/>
					<Dashboard
						urls={urls}
						setUrls={setUrls}
						loading={loading}
						error={error}
						onUrlCardClick={handleUrlCardClick}
					/>
				</>
			) : (
				<div className="bg-white rounded-xl max-w-4xl shadow-xl p-8 mx-auto">
					<div className="flex items-center justify-center h-32">
						<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
					</div>
				</div>
			)}
		</div>
	);
}
