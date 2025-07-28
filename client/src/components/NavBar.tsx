import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const location = useLocation();

	const handleLoginClick = () => {
		// Preserve current search parameters when navigating to login
		navigate(`/login${location.search}`);
	};

	const handleSignupClick = () => {
		// Preserve current search parameters when navigating to signup
		navigate(`/signup${location.search}`);
	};

	const handleLogout = () => {
		logout();
		navigate('/');
	};

	return (
		<nav className="bg-white shadow-sm border-b border-gray-200">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					{/* Logo */}
					<div className="flex items-center">
						<Link
							to="/"
							className="text-xl font-bold text-blue-600 hover:text-blue-700 transition-colors"
						>
							Linky
						</Link>
					</div>

					{/* Navigation Links */}
					<div className="flex items-center space-x-4">
						{user ? (
							<div className="flex items-center space-x-4">
								{/* Uncomment when you add these routes
                <Link
                  to="/dashboard"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Dashboard
                </Link>
                <Link
                  to="/my-urls"
                  className="text-gray-700 hover:text-blue-600 transition-colors"
                >
                  My URLs
                </Link>
                */}
								<button
									onClick={handleLogout}
									className="bg-blue-400 text-white px-4 py-2 rounded-md hover:bg-blue-500 transition-colors"
								>
									Logout
								</button>
							</div>
						) : (
							<div className="flex items-center space-x-3">
								<button
									onClick={handleLoginClick}
									className="text-gray-700 hover:text-blue-600 transition-colors"
								>
									Sign In
								</button>
								<button
									onClick={handleSignupClick}
									className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
								>
									Sign Up
								</button>
							</div>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
}
