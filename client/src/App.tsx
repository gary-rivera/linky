import {
	BrowserRouter as Router,
	Routes,
	Route,
	Navigate,
	useLocation,
} from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import Modal from './components/Modal';
import LoginModal from './components/LoginModal';
import SignupModal from './components/SignupModal';
import { Toaster } from 'react-hot-toast';
import { useAuthModals } from './hooks/useAuthModals';

function AppContent() {
	const location = useLocation();
	const { user } = useAuth();
	const {
		isLoginModalOpen,
		isSignupModalOpen,
		handleCloseModal,
		handleSwitchToSignup,
		handleSwitchToLogin,
	} = useAuthModals();

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			<NavBar />
			<main>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route
						path="/login"
						element={
							user ? <Navigate to={`/${location.search}`} replace /> : <Home />
						}
					/>
					<Route
						path="/signup"
						element={
							user ? <Navigate to={`/${location.search}`} replace /> : <Home />
						}
					/>
				</Routes>
			</main>

			{/* Login Modal */}
			<Modal
				isOpen={isLoginModalOpen}
				onClose={handleCloseModal}
				title="Sign In to Your Account"
			>
				<LoginModal
					onClose={handleCloseModal}
					onSwitchToSignup={handleSwitchToSignup}
				/>
			</Modal>

			{/* Signup Modal */}
			<Modal
				isOpen={isSignupModalOpen}
				onClose={handleCloseModal}
				title="Create Your Account"
			>
				<SignupModal
					onClose={handleCloseModal}
					onSwitchToLogin={handleSwitchToLogin}
				/>
			</Modal>

			<Toaster position="top-right" />
		</div>
	);
}

function App() {
	return (
		<AuthProvider>
			<Router>
				<AppContent />
			</Router>
		</AuthProvider>
	);
}

export default App;
