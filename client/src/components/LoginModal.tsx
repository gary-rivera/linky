import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

interface LoginModalProps {
	onClose: () => void;
	onSwitchToSignup: () => void;
}

export default function LoginModal({
	onClose,
	onSwitchToSignup,
}: LoginModalProps) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);
	const { login } = useAuth();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			await login(email, password);
			toast.success('Logged in successfully!');
			onClose();
		} catch (error: any) {
			const errorMessage =
				error.response?.data?.error || error.message || 'Login failed';
			toast.error(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<div>
				<label
					htmlFor="email"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Email address
				</label>
				<input
					type="email"
					id="email"
					value={email}
					autoFocus
					onChange={(e) => setEmail(e.target.value)}
					required
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Enter your email"
				/>
			</div>

			<div>
				<label
					htmlFor="password"
					className="block text-sm font-medium text-gray-700 mb-2"
				>
					Password
				</label>
				<input
					type="password"
					id="password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
					placeholder="Enter your password"
				/>
			</div>

			<button
				type="submit"
				disabled={loading}
				className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
			>
				{loading ? (
					<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
				) : (
					'Sign In'
				)}
			</button>

			<div className="text-center">
				<p className="text-sm text-gray-600">
					Don't have an account?{' '}
					<button
						type="button"
						onClick={onSwitchToSignup}
						className="text-blue-600 hover:text-blue-500 font-medium"
					>
						Sign up
					</button>
				</p>
			</div>
		</form>
	);
}
