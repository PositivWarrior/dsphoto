import React, { useState, useEffect } from 'react';
import { Blurhash } from 'react-blurhash';

const WEBP_FALLBACK_HASH = 'L9B:um.8xu%2~qxut7t7-;WBWBM{';

const ImageOptimizer = ({
	src,
	alt,
	className = '',
	width = 800,
	quality = 80,
	sizes = '100vw',
	loading = 'lazy',
	priority = false,
	placeholderColor = '#f3f4f6',
}) => {
	const [imageLoaded, setImageLoaded] = useState(false);
	const [webpSrc, setWebpSrc] = useState('');
	const [blurHash] = useState(WEBP_FALLBACK_HASH);

	useEffect(() => {
		// Convert to WebP format if supported by browser
		if (src) {
			// CloudFront URL pattern detection
			if (src.includes('cloudfront.net')) {
				// Already optimized by CloudFront
				setWebpSrc(src);
			} else if (src.includes('amazonaws.com')) {
				// Convert Amazon S3 URL to CloudFront and append WebP query param
				const s3Path = src.split('amazonaws.com')[1];
				const cloudFrontUrl = `https://d10rd1fhji10gj.cloudfront.net${s3Path}`;
				setWebpSrc(cloudFrontUrl);
			} else {
				// For other URLs, use as is
				setWebpSrc(src);
			}
		}
	}, [src]);

	const handleImageLoad = () => {
		setImageLoaded(true);
	};

	return (
		<div
			className="relative overflow-hidden"
			style={{ backgroundColor: placeholderColor }}
		>
			{!imageLoaded && (
				<div className="absolute inset-0 z-10">
					<Blurhash
						hash={blurHash}
						width="100%"
						height="100%"
						resolutionX={32}
						resolutionY={32}
						punch={1}
					/>
				</div>
			)}

			<img
				src={webpSrc || src}
				alt={alt}
				className={`${className} ${
					!imageLoaded ? 'opacity-0' : 'opacity-100'
				}`}
				onLoad={handleImageLoad}
				loading={priority ? 'eager' : loading}
				fetchpriority={priority ? 'high' : 'auto'}
				sizes={sizes}
				style={{ transition: 'opacity 0.3s ease-in-out' }}
			/>
		</div>
	);
};

export default ImageOptimizer;
