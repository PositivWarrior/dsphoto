import React, { useState, useEffect } from 'react';
import { getOptimizedImageUrl } from '../api';

const createWebPUrl = (url) => {
	// Check if URL is from S3
	if (url.includes('ds-photo.s3.eu-north-1.amazonaws.com')) {
		// We'll use the Cloudinary service to convert and resize S3 images on-the-fly
		// Format: https://res.cloudinary.com/YOUR_CLOUD_NAME/image/fetch/f_auto,q_auto,w_[WIDTH]/S3_URL

		// Replace with your actual Cloudinary cloud name if you have one
		// Otherwise, look at implementing a serverless function that can transform images
		// const cloudinaryBase = 'https://res.cloudinary.com/your-cloud-name/image/fetch';
		// const encodedUrl = encodeURIComponent(url);
		// return `${cloudinaryBase}/f_auto,q_auto,w_800/${encodedUrl}`;

		// Since we don't have Cloudinary credentials, we'll just return the original URL for now
		return url;
	}
	return url;
};

const getImageDimensions = (url) => {
	// Simple image dimension estimation based on container
	// For gallery thumbnails (w-full h-64 object-cover)
	if (url.includes('/images/')) {
		return {
			width: 800,
			height: 400,
		};
	}
	return {
		width: 1200,
		height: 800,
	};
};

const ImageOptimizer = ({
	src,
	alt,
	className,
	sizes = '100vw',
	priority = false,
}) => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [optimizedSrc, setOptimizedSrc] = useState('');

	// Responsive image breakpoints
	const breakpoints = [320, 640, 768, 1024, 1280];

	useEffect(() => {
		// Get optimized version for the main image
		const optimizedWebpUrl = getOptimizedImageUrl(src, 800, 'webp');
		setOptimizedSrc(optimizedWebpUrl);

		// Preload the image
		const img = new Image();
		img.src = optimizedWebpUrl;
		img.onload = () => setLoading(false);
		img.onerror = () => {
			// Fallback to original format if WebP fails
			console.warn('WebP image failed to load:', optimizedWebpUrl);
			setError(true);
			const fallbackImg = new Image();
			fallbackImg.src = src;
			fallbackImg.onload = () => setLoading(false);
			fallbackImg.onerror = () => setError(true);
		};
	}, [src]);

	// Generate srcset for responsive images
	const generateSrcSet = () => {
		return breakpoints
			.map((bp) => `${getOptimizedImageUrl(src, bp, 'webp')} ${bp}w`)
			.join(', ');
	};

	if (error) {
		return (
			<div
				className={`bg-gray-200 flex items-center justify-center ${className}`}
			>
				<span>Failed to load image</span>
			</div>
		);
	}

	const { width, height } = getImageDimensions(src);

	return (
		<>
			{loading && (
				<div className={`bg-gray-200 animate-pulse ${className}`} />
			)}
			<img
				src={optimizedSrc || src}
				srcSet={generateSrcSet()}
				width={width}
				height={height}
				alt={alt}
				className={`${className} ${loading ? 'hidden' : ''}`}
				loading={priority ? 'eager' : 'lazy'}
				sizes={sizes}
				style={{ opacity: loading ? 0 : 1 }}
				fetchPriority={priority ? 'high' : 'auto'}
				onError={(e) => {
					// If optimized image fails, fallback to original
					console.warn('Image failed to load:', e.target.src);
					if (e.target.src !== src) {
						e.target.src = src;
					}
				}}
			/>
			{priority && (
				<link
					rel="preload"
					href={optimizedSrc || src}
					as="image"
					fetchPriority="high"
				/>
			)}
		</>
	);
};

export default ImageOptimizer;
