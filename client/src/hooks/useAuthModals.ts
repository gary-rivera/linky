import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface AuthModalActions {
	handleCloseModal: () => void;
	handleSwitchToSignup: () => void;
	handleSwitchToLogin: () => void;
}
export interface UseAuthModalsResult extends AuthModalActions {
	isLoginModalOpen: boolean;
	isSignupModalOpen: boolean;
}

type ModalAction = 'close' | 'switchToSignup' | 'switchToLogin';

export const useAuthModals = () => {
	const location = useLocation();
	const navigate = useNavigate();
	const { user } = useAuth();
	const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
	const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

	useEffect(() => {
		if (location.pathname === '/login' && !user) {
			setIsLoginModalOpen(true);
		} else if (location.pathname === '/signup' && !user) {
			setIsSignupModalOpen(true);
		} else {
			setIsLoginModalOpen(false);
			setIsSignupModalOpen(false);
		}
	}, [location.pathname, user]);

	// Redirect authenticated users away from auth routes
	useEffect(() => {
		if (
			user &&
			(location.pathname === '/login' || location.pathname === '/signup')
		) {
			navigate(`/${location.search}`, { replace: true });
		}
	}, [user, location.pathname, location.search, navigate]);

	const handleModalAction = (action: ModalAction) => {
		switch (action) {
			case 'close':
				setIsLoginModalOpen(false);
				setIsSignupModalOpen(false);
				navigate(`/${location.search}`, { replace: true });
				break;

			case 'switchToSignup':
				setIsLoginModalOpen(false);
				setIsSignupModalOpen(true);
				navigate(`/signup${location.search}`, { replace: true });
				break;

			case 'switchToLogin':
				setIsSignupModalOpen(false);
				setIsLoginModalOpen(true);
				navigate(`/login${location.search}`, { replace: true });
				break;

			default:
				console.warn(`Unknown modal action: ${action}`);
		}
	};

	return {
		isLoginModalOpen,
		isSignupModalOpen,
		handleModalAction,
		// Convenience methods for backward compatibility
		handleCloseModal: () => handleModalAction('close'),
		handleSwitchToSignup: () => handleModalAction('switchToSignup'),
		handleSwitchToLogin: () => handleModalAction('switchToLogin'),
	};
};
