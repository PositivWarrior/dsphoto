import React, { useState, useEffect } from 'react';

const ImageOptimizer = ({ src, alt, className, sizes = '100vw' }) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);

	useEffect(() => {
		const img = new Image();
		img.src = src;
		img.onload = () => setLoading(false);
		img.onerror = () => setError(true);
	}, [src]);

	if (error) {
		return (
			<div
				className={`bg-gray-200 flex items-center justify-center ${className}`}
			>
				<span>Failed to load image</span>
			</div>
		);
	}

	return (
		<>
			{loading && (
				<div className={`bg-gray-200 animate-pulse ${className}`} />
			)}
			<img
				src={src}
				alt={alt}
				className={`${className} ${loading ? 'hidden' : ''}`}
				loading="lazy"
				sizes={sizes}
				style={{ opacity: loading ? 0 : 1 }}
			/>
		</>
	);
};

export default ImageOptimizer;
