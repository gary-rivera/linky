import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { api } from '../services/api';

interface User {
	id: number;
	email: string;
}

interface AuthResponse {
	token: string;
	user: User;
}

interface AuthContextType {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	signup: (email: string, password: string) => Promise<void>;
	logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	const context = useContext(AuthContext);
	if (!context) {
		throw new Error('useAuth must be used within an AuthProvider');
	}
	return context;
};

interface AuthProviderProps {
	children: ReactNode;
}

const TOKEN_KEY = 'linky_auth_token';
const USER_KEY = 'linky_user_data';

export const AuthProvider = ({ children }: AuthProviderProps) => {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem(TOKEN_KEY);
		const userData = localStorage.getItem(USER_KEY);

		if (token && userData) {
			try {
				setUser(JSON.parse(userData));
				api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
			} catch (error) {
				console.error('Failed to parse stored user data:', error);

				localStorage.removeItem(TOKEN_KEY);
				localStorage.removeItem(USER_KEY);
			}
		}
		setLoading(false);
	}, []);

	const login = async (email: string, password: string) => {
		const response = await api.post('/auth/login', { email, password });
		const { token, user: userData } = response.data as AuthResponse;

		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(userData));
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

		setUser(userData);
	};

	const signup = async (email: string, password: string) => {
		const response = await api.post('/auth/signup', { email, password });
		const { token, user: userData } = response.data as AuthResponse;

		localStorage.setItem(TOKEN_KEY, token);
		localStorage.setItem(USER_KEY, JSON.stringify(userData));
		api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
		setUser(userData);
	};

	const logout = () => {
		localStorage.removeItem(TOKEN_KEY);
		localStorage.removeItem(USER_KEY);
		delete api.defaults.headers.common['Authorization'];
		setUser(null);
	};

	return (
		<AuthContext.Provider value={{ user, loading, login, signup, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export default AuthProvider;
