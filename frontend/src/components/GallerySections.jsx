import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from './LoadingSpinner';
import { API } from '../api';

const GallerySections = () => {
	const [galleryData, setGalleryData] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);
	const [retryCount, setRetryCount] = useState(0);
	const MAX_RETRIES = 3;

	useEffect(() => {
		const fetchGalleryData = async () => {
			try {
				setLoading(true);
				setError(null);
				console.log('Fetching gallery data...'); // Debug log

				const response = await API.get('/images');
				console.log('API Response:', response.data); // Debug log

				if (!Array.isArray(response.data)) {
					throw new Error('Invalid data format received from API');
				}

				const data = response.data;

				// Group images by category
				const groupedData = data.reduce((acc, image) => {
					if (!image.category) {
						console.warn('Image missing category:', image); // Debug log
						return acc;
					}
					const category = image.category.toLowerCase();
					if (!acc[category]) {
						acc[category] = [];
					}
					acc[category].push(image);
					return acc;
				}, {});

				const formattedData = Object.keys(groupedData)
					.map((category) => ({
						id: category,
						title:
							category.charAt(0).toUpperCase() +
							category.slice(1),
						images: groupedData[category].sort(
							(a, b) => (a.order || 0) - (b.order || 0),
						),
					}))
					.sort((a, b) => a.title.localeCompare(b.title));

				console.log('Formatted gallery data:', formattedData); // Debug log
				setGalleryData(formattedData);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching gallery data:', error);
				setError(error.message || 'Failed to load gallery sections');

				// Implement retry logic
				if (retryCount < MAX_RETRIES) {
					console.log(
						`Retrying... Attempt ${
							retryCount + 1
						} of ${MAX_RETRIES}`,
					);
					setRetryCount((prev) => prev + 1);
					setTimeout(() => {
						fetchGalleryData();
					}, 2000 * (retryCount + 1)); // Exponential backoff
				} else {
					setLoading(false);
				}
			}
		};

		fetchGalleryData();
	}, []); // Note: retryCount is intentionally left out to prevent infinite loops

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<LoadingSpinner />
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<h2 className="text-2xl font-bold text-red-600 mb-4">
						{error}
					</h2>
					<button
						onClick={() => {
							setRetryCount(0);
							setLoading(true);
						}}
						className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
					>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<div id="gallery" className="py-12 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-5xl font-heading text-center mb-12">
					Explore My Latest Works
				</h1>
				{galleryData.length === 0 ? (
					<div className="text-center text-gray-600">
						<p>No gallery sections available at the moment.</p>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{galleryData.map((section) => (
							<Link
								to={`/gallery/${section.id}`}
								key={section.id}
								className="relative block group rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
							>
								{section.images && section.images.length > 0 ? (
									<div className="relative">
										<img
											src={section.images[0].url}
											alt={`Preview of ${section.title} gallery`}
											className="w-full h-64 object-cover"
											onError={(e) => {
												console.error(
													`Failed to load image: ${section.images[0].url}`,
												);
												e.target.src =
													'/placeholder-image.jpg'; // Add a placeholder image
											}}
										/>
										<div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity group-hover:bg-opacity-40" />
									</div>
								) : (
									<div className="w-full h-64 bg-gray-300 flex items-center justify-center">
										<p>No image available</p>
									</div>
								)}

								<div className="absolute inset-0 flex items-center justify-center">
									<h2 className="dancing-script-gallery-title text-4xl md:text-6xl text-white text-center drop-shadow-lg">
										{section.title}
									</h2>
								</div>
							</Link>
						))}
					</div>
				)}
			</div>
		</div>
	);
};

export default GallerySections;
