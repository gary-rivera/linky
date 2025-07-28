import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: React.ReactNode;
	title: string;
}

export default function Modal({
	isOpen,
	onClose,
	children,
	title,
}: ModalProps) {
	const [isVisible, setIsVisible] = useState(false);
	const [shouldRender, setShouldRender] = useState(false);

	useEffect(() => {
		if (isOpen) {
			setShouldRender(true);
			document.body.style.overflow = 'hidden';
			// Use requestAnimationFrame for better timing synchronization
			requestAnimationFrame(() => {
				requestAnimationFrame(() => {
					setIsVisible(true);
				});
			});
		} else {
			setIsVisible(false);
			document.body.style.overflow = 'unset';
			// Wait for transition to complete before unmounting
			const timer = setTimeout(() => setShouldRender(false), 300);
			return () => clearTimeout(timer);
		}

		return () => {
			document.body.style.overflow = 'unset';
		};
	}, [isOpen]);

	useEffect(() => {
		const handleEscape = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		if (isOpen) {
			document.addEventListener('keydown', handleEscape);
		}

		return () => {
			document.removeEventListener('keydown', handleEscape);
		};
	}, [isOpen, onClose]);

	if (!shouldRender) return null;

	return createPortal(
		<div
			className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-300 ${
				isVisible
					? 'opacity-100 backdrop-blur-sm'
					: 'opacity-0 backdrop-blur-none'
			}`}
		>
			{/* Backdrop */}
			<div className="absolute inset-0 bg-black/20" onClick={onClose} />

			{/* Modal */}
			<div
				className={`relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto transition-all duration-300 ${
					isVisible
						? 'opacity-100 scale-100 translate-y-0'
						: 'opacity-0 scale-95 translate-y-4'
				}`}
			>
				{/* Header */}
				<div className="flex items-center justify-between p-6 border-b border-gray-200">
					<h2 className="text-xl font-semibold text-gray-900">{title}</h2>
					<button
						onClick={onClose}
						className="text-gray-400 hover:text-gray-600 transition-colors"
					>
						<X className="h-6 w-6" />
					</button>
				</div>

				{/* Content */}
				<div className="p-6">{children}</div>
			</div>
		</div>,
		document.body
	);
}
