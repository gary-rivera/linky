import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import type { UserUrl } from '../types';

export default function Dashboard({
	urls,
	loading,
	error,
	onUrlCardClick,
}: {
	urls: UserUrl[];
	setUrls: (urls: UserUrl[]) => void;
	loading: boolean;
	error: string | null;
	onUrlCardClick: (url: UserUrl) => void;
}) {
	const { user } = useAuth();
	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		if (user) {
			setShouldRender(true);
			// Small delay to ensure the element is in DOM before starting transition
			setTimeout(() => setIsVisible(true), 10);
		} else {
			setIsVisible(false);
			// Wait for transition to complete before unmounting
			const timer = setTimeout(() => setShouldRender(false), 300);
			return () => clearTimeout(timer);
		}
	}, [user]);

	if (!shouldRender) return null;

	return (
		<div
			className={`mt-8 max-w-7xl mx-auto transition-all duration-300 ease-in-out transform ${
				isVisible
					? 'opacity-100 translate-y-0 scale-100'
					: 'opacity-0 translate-y-4 scale-95'
			}`}
		>
			<div className="bg-white rounded-xl shadow-xl p-6">
				<h2 className="text-2xl font-bold text-gray-700 mb-6">My Links</h2>

				{loading && (
					<div className="flex items-center justify-center py-8">
						<div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
					</div>
				)}

				{error && (
					<div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
						<p className="text-sm text-red-700">{error}</p>
					</div>
				)}

				{!loading && !error && urls.length === 0 && (
					<div className="text-center py-8">
						<p className="text-gray-500">
							No shortened URLs yet. Create your first one above!
						</p>
					</div>
				)}

				{!loading && urls.length > 0 && (
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-6">
						{urls.map((url) => (
							<div
								key={url.id}
								className="bg-sky-50 border border-gray-200 rounded-lg py-4 px-5 hover:shadow-md hover:bg-sky-100 cursor-pointer transition-all duration-200 hover:border-sky-300"
								onClick={() => onUrlCardClick(url)}
								role="button"
								tabIndex={0}
								onKeyDown={(e) => {
									if (e.key === 'Enter' || e.key === ' ') {
										e.preventDefault();
										onUrlCardClick(url);
									}
								}}
							>
								<div className="space-y-3">
									<div className="flex justify-between items-start">
										<div className="flex-1 mr-2">
											<p className="text-md font-medium text-sky-600 truncate">
												/{url.slug}
											</p>
										</div>
										<div className="flex-shrink-0">
											<p className="text-xs font-medium text-gray-500 mb-1">
												Visited:
												<span className="text-sm font-medium text-gray-900 text-right pl-2">
													{url.visit_count}
												</span>
											</p>
										</div>
									</div>

									<div>
										<p className="text-xs font-medium text-gray-500 mb-1">
											Original URL:
										</p>
										<p className="text-sm text-gray-700 truncate">
											{url.original_url.substring(0, 35)}...
										</p>
									</div>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
