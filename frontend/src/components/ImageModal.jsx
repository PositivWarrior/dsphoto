import React, { useEffect } from 'react';
import ImageOptimizer from './ImageOptimizer';

const ImageModal = ({ image, onClose }) => {
	// Close modal when ESC key is pressed
	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') onClose();
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [onClose]);

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
			onClick={onClose}
		>
			<div
				className="relative max-w-4xl max-h-[90vh] mx-auto p-4"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					className="absolute top-0 right-0 -mt-10 -mr-4 text-white text-2xl font-bold z-50"
					onClick={onClose}
				>
					×
				</button>

				<div className="bg-white rounded-lg overflow-hidden shadow-2xl max-h-[80vh]">
					<div className="relative p-2">
						<ImageOptimizer
							src={image.url}
							alt={image.title || 'Gallery image'}
							className="max-h-[70vh] w-auto mx-auto object-contain"
							priority={true}
						/>
					</div>

					{image.title && (
						<div className="p-4 bg-white">
							<h3 className="text-xl font-semibold">
								{image.title}
							</h3>
							{image.description && (
								<p className="text-gray-600 mt-2">
									{image.description}
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ImageModal;
