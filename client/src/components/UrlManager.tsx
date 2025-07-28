import React, { useState, useEffect, memo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api, ApiError, handleApiError } from '../services/api';
import type {
	ShortenUrlResponse,
	ShortenUrlSuccessResponse,
	ModifyUrlResponse,
	ModifyUrlSuccessResponse,
} from '../types';
import { Copy, Check, ExternalLink, Repeat, Edit } from 'lucide-react';

import toast from 'react-hot-toast';
import { copyUrlToClipboard } from '../utils/clipboard';
import { isValidUrl } from '../utils/url';

interface UrlManagerProps {
	persistedShortenedUrl: ShortenUrlSuccessResponse | null;
	onShortenedUrlChange: (
		shortenedUrl: ShortenUrlSuccessResponse | null
	) => void;
}

const UrlManager = memo(function UrlManager({
	persistedShortenedUrl,
	onShortenedUrlChange,
}: UrlManagerProps) {
	const { user } = useAuth();
	const [url, setUrl] = useState<string>('');
	const [loading, setLoading] = useState<boolean>(false);
	const [hasSubmitted, setHasSubmitted] = useState<boolean>(
		!!persistedShortenedUrl
	);

	const [copied, setCopied] = useState<boolean>(false);

	const [newSlug, setNewSlug] = useState<string>('');
	const [editingSlug, setEditingSlug] = useState<boolean>(false);

	const shortenedUrl = persistedShortenedUrl;

	useEffect(() => {
		console.log(
			'[UrlManager][useEffect] Attempting to set initial URL from persistedShortenedUrl',
			shortenedUrl
		);
		if (shortenedUrl) {
			const { original_url } = shortenedUrl as ShortenUrlSuccessResponse;
			setHasSubmitted(true);
			if (original_url && !url) {
				setUrl(original_url);
			}
		} else {
			setHasSubmitted(false);
		}
	}, [shortenedUrl, url]);

	const handleUrlShortenSubmit = async (
		evt: React.FormEvent
	): Promise<void> => {
		evt.preventDefault();
		console.log('Submitting URL for shortening:', url);
		const trimmedUrl = url.trim();

		if (!trimmedUrl) {
			toast.error('Please enter a URL');
			return;
		}

		if (!isValidUrl(trimmedUrl)) return;

		setLoading(true);
		setHasSubmitted(true);

		try {
			const response = await api.post<ShortenUrlResponse>('/url/shorten', {
				url: trimmedUrl,
			});
			onShortenedUrlChange(response.data as ShortenUrlSuccessResponse);
		} catch (error) {
			try {
				handleApiError(error);
			} catch (apiError) {
				if (apiError instanceof ApiError) {
					if (apiError.status === 409) {
						toast('This URL was already shortened by you previously!', {
							duration: 4000,
							style: {
								background: '#fffbeb',
								color: '#374151',
								border: '1px solid #fef3c7',
							},
						});
						onShortenedUrlChange(
							apiError.resource as ShortenUrlSuccessResponse
						);
					} else {
						toast.error(apiError.message);
						setHasSubmitted(true);
					}
				} else {
					toast.error('Failed to shorten URL');
					setHasSubmitted(false);
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const handleSlugEdit = async (): Promise<void> => {
		if (!shortenedUrl || !newSlug.trim()) {
			toast.error('Please enter a valid slug');
			return;
		}

		setLoading(true);

		try {
			const response = await api.patch<ModifyUrlResponse>(
				`/url/modify/${shortenedUrl.id}`,
				{ newSlug: newSlug.trim() }
			);

			const urlData = response.data as ModifyUrlSuccessResponse;

			if (urlData.slug_unchanged) {
				toast('Slug is already set to this value', {
					duration: 3000,
					style: {
						background: '#fef3c7',
						color: '#374151',
						border: '1px solid #fef3c7',
					},
				});
			} else {
				toast.success('Slug updated successfully!');
			}

			onShortenedUrlChange(urlData);
			setEditingSlug(false);
			setNewSlug('');
		} catch (error) {
			try {
				handleApiError(error);
			} catch (apiError) {
				if (apiError instanceof ApiError) {
					toast.error(apiError.message);
				} else {
					toast.error('Failed to update slug. Please try again.');
				}
			}
		} finally {
			setLoading(false);
		}
	};

	const cancelSlugEdit = (): void => {
		setEditingSlug(false);
		setNewSlug('');
	};

	const reset = () => {
		setUrl('');
		onShortenedUrlChange(null);
		setHasSubmitted(false);
		setLoading(false);
		setCopied(false);
		setEditingSlug(false);
		setNewSlug('');
	};

	return (
		<div className="bg-white rounded-xl max-w-4xl shadow-xl p-8 mx-auto transition-all duration-1000 ease-in-out relative">
			<div className="text-left mb-4">
				<h1 className="text-3xl font-bold text-gray-700 mb-2">Link Manager</h1>
				<p className="text-lg text-gray-500">
					Shorten, modify, and test your URLs with ease
				</p>

				{loading && (
					<div className="absolute top-4 right-4 pt-7 pr-7">
						<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
					</div>
				)}
				{hasSubmitted && !loading && (
					<div className="absolute top-4 right-4 pt-5 pr-5">
						<button
							onClick={reset}
							className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 transition-colors duration-400"
							title="Shorten another URL"
						>
							<Repeat className="h-4 w-4 text-gray-500" />
						</button>
					</div>
				)}
			</div>
			<div onSubmit={handleUrlShortenSubmit} className="space-y-4">
				<div className="px-6 py-2 border-none rounded-lg">
					<div>
						<label
							htmlFor="url"
							className="block text-sm font-medium text-gray-400 mb-2"
						>
							Long URL
						</label>
						<input
							type="url"
							id="url"
							name="url"
							value={url}
							onChange={(e) => setUrl(e.target.value)}
							placeholder="https://example.com or example.com"
							readOnly={hasSubmitted && !loading}
							autoComplete="url"
							autoFocus
							style={{
								WebkitBoxShadow: url ? '0 0 0 30px #f9fafb inset' : 'none',
								border: '1px solid #e5e7eb',
							}}
							className={`w-full px-4 py-3 rounded-lg focus:outline-none bg-gray-50 border border-gray-200 transition-all duration-300 ease-in-out overflow-y-auto break-all ${
								hasSubmitted && !loading ? 'cursor-default' : ' '
							}`}
						/>
					</div>

					{/* initial submit - collapses first */}
					<div
						className={`transition-all duration-500 ease-out overflow-hidden ${
							hasSubmitted
								? 'max-h-0 opacity-0 mt-0'
								: 'max-h-20 opacity-100 mt-4'
						}`}
					>
						<button
							onClick={handleUrlShortenSubmit}
							disabled={loading}
							className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors duration-200"
						>
							Shorten URL
						</button>
					</div>

					<div
						className={`transition-all duration-800 ease-out overflow-hidden ${
							shortenedUrl
								? 'max-h-80 opacity-100 mt-4'
								: 'max-h-0 opacity-0 mt-0'
						}`}
						style={{
							transitionDelay: shortenedUrl ? '400ms' : '0ms',
						}}
					>
						{shortenedUrl && (
							<div className="bg-green-50 border border-green-200 px-4 py-3 rounded-md">
								<div className="flex items-center justify-between mb-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Shortened URL:
									</label>
								</div>

								<div className="flex items-center space-x-2 min-h-[50px] overflow-hidden">
									{/* Non-editing state */}
									<div
										className={`flex items-center space-x-2 transition-all duration-400 ease-in-out ${
											editingSlug
												? 'w-0 opacity-0 -translate-x-4'
												: 'w-full opacity-100 translate-x-0'
										}`}
										style={{
											minWidth: editingSlug ? '0' : 'auto',
											overflow: 'hidden',
											transitionDelay: editingSlug ? '0ms' : '200ms', // Delay when showing, no delay when hiding
										}}
									>
										<input
											type="text"
											value={shortenedUrl.shortened_url}
											readOnly
											style={{
												WebkitBoxShadow: '0 0 0 30px #f9fafb inset',
												border: '1px solid #e5e7eb',
											}}
											className="w-96 px-3 py-2 rounded-md bg-gray-50 focus:ring-1 focus:ring-blue-300 focus:border-transparent focus:outline-none transition-all duration-300 ease-in-out cursor-default"
										/>

										{user && (
											<button
												onClick={() => {
													setEditingSlug(true);
													setNewSlug(shortenedUrl.slug);
												}}
												className="flex items-center space-x-1 px-3 py-2 bg-sky-400 text-white rounded-md hover:bg-sky-500 transition-colors duration-200 whitespace-nowrap"
												disabled={loading}
											>
												<Edit className="h-4 w-4" />
												<span>Edit</span>
											</button>
										)}

										<button
											onClick={() =>
												copyUrlToClipboard(
													shortenedUrl.shortened_url,
													setCopied
												)
											}
											type="button"
											className="flex items-center space-x-1 px-3 py-2 bg-blue-400 text-white rounded-md hover:bg-blue-500 transition-colors duration-200 whitespace-nowrap"
										>
											{copied ? (
												<Check className="h-4 w-4" />
											) : (
												<Copy className="h-4 w-4" />
											)}
											<span>{copied ? 'Copied!' : 'Copy'}</span>
										</button>

										<a
											href={`${shortenedUrl.shortened_url}`}
											target="_blank"
											rel="noopener noreferrer"
											className="flex items-center space-x-1 px-3 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 transition-colors duration-200 whitespace-nowrap"
										>
											<ExternalLink className="h-4 w-4" />
											<span>Visit</span>
										</a>
									</div>

									{/* Editing state */}
									<div
										className={`flex items-center space-x-2 transition-all duration-400 ease-in-out ${
											editingSlug
												? 'w-full opacity-100 translate-x-0'
												: 'w-0 opacity-0 translate-x-4'
										}`}
										style={{
											minWidth: editingSlug ? 'auto' : '0',
											overflow: 'hidden',
											transitionDelay: editingSlug ? '200ms' : '0ms',
										}}
									>
										<div className="flex items-center space-x-2 flex-1">
											<span className="text-md text-gray-500 whitespace-nowrap">
												{shortenedUrl.shortened_url
													.split('/')
													.slice(0, -1)
													.join('/')}
												/
											</span>
											<input
												type="text"
												value={newSlug}
												onChange={(e) => setNewSlug(e.target.value)}
												style={{
													WebkitBoxShadow: url
														? '0 0 0 30px #f9fafb inset'
														: 'none',
												}}
												className="flex-1 px-3 py-2 rounded-md bg-white border border-gray-300 focus:border-sky-300 focus:outline-none transition-all duration-300 ease-in-out"
												placeholder={shortenedUrl.slug}
												disabled={loading}
											/>
										</div>
										<div className="flex items-center space-x-2">
											<button
												onClick={handleSlugEdit}
												disabled={loading || !newSlug.trim()}
												className="px-4 py-2 bg-sky-400 text-white rounded-md hover:bg-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
											>
												Save
											</button>
											<button
												onClick={cancelSlugEdit}
												disabled={loading}
												className="px-4 py-2 bg-gray-400 text-white rounded-md hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 whitespace-nowrap"
											>
												Cancel
											</button>
										</div>
									</div>
								</div>
								{/* Warning for unreachable URLs - Now nested within success section */}
								{shortenedUrl.is_reachable === false && (
									<div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded ">
										<p className="text-sm">
											<strong>Warning:</strong> The original URL appears to be
											unreachable. The shortened URL will still work, but the
											destination may not load.
										</p>
									</div>
								)}
								{!user && (
									<div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
										<p className="text-sm text-blue-700">
											💡 <span className="font-medium">Sign in</span> to unlock
											editing slugs and managing all your links
										</p>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	);
});

export default UrlManager;
