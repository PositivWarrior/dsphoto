import React, { useState, useEffect, memo } from 'react';
import { Blurhash } from 'react-blurhash';
import { getOptimizedImageUrl } from '../api';

const WEBP_FALLBACK_HASH = 'L9B:um.8xu%2~qxut7t7-;WBWBM{';

const ImageOptimizer = memo(
	({
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
		const [optimizedSrc, setOptimizedSrc] = useState('');
		const [blurHash] = useState(WEBP_FALLBACK_HASH);

		useEffect(() => {
			if (src) {
				const targetUrl = getOptimizedImageUrl(
					src,
					width,
					'webp',
					quality,
				);
				console.log(
					`[ImageOptimizer] Props: src=${src}, width=${width}. Generated targetUrl: ${targetUrl}`,
				);
				setOptimizedSrc(targetUrl);
			}
		}, [src, width, quality]);

		const handleImageLoad = () => {
			setImageLoaded(true);
		};

		const handleImageError = (e) => {
			console.warn(`Failed to load image: ${optimizedSrc || src}`);
			e.target.style.display = 'none';
		};

		return (
			<div
				className="relative overflow-hidden"
				style={{ backgroundColor: placeholderColor }}
			>
				{console.log(
					`[ImageOptimizer] Rendering img with src: ${
						optimizedSrc || src
					}`,
				)}
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
					src={optimizedSrc || src}
					alt={alt}
					className={`${className} ${
						!imageLoaded ? 'opacity-0' : 'opacity-100'
					}`}
					onLoad={handleImageLoad}
					onError={handleImageError}
					loading={priority ? 'eager' : loading}
					fetchpriority={priority ? 'high' : 'auto'}
					sizes={sizes}
					style={{ transition: 'opacity 0.3s ease-in-out' }}
				/>
			</div>
		);
	},
);

export default ImageOptimizer;
