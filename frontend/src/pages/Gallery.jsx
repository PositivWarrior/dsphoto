import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import { API } from '../api';
import ImageOptimizer from '../components/ImageOptimizer';

const GalleryPage = () => {
	const [galleryData, setGalleryData] = useState([]);
	const [loading, setLoading] = useState(true);
	const location = useLocation();

	const fetchGalleryData = async () => {
		try {
			const response = await API.get('/images');
			const data = response.data;

			// Group images by category and remove any duplicate entries
			const uniqueCategories = new Set(); // To track unique categories
			const groupedData = data.reduce((acc, image) => {
				const category = image.category || 'unknown';
				if (!uniqueCategories.has(category)) {
					uniqueCategories.add(category);
					acc[category] = [];
				}
				acc[category].push(image);
				return acc;
			}, {});

			const formattedData = Object.keys(groupedData).map((category) => ({
				id: category,
				title: category.charAt(0).toUpperCase() + category.slice(1),
				images: groupedData[category].sort(
					(a, b) => (a.order ?? 0) - (b.order ?? 0),
				),
			}));

			setGalleryData(formattedData);
		} catch (error) {
			console.error('Error fetching gallery data:', error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchGalleryData();
	}, [location.pathname]);

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div id="gallery" className="py-12 bg-gray-100 mt-20">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-12">
					Utforsk Arbeidet Mitt
					<Helmet>
						<title>Utforsk Arbeidet Mitt</title>
						<meta
							name="description"
							content="Se mine nyeste fotografier i bryllup, natur, portrett, og mer."
						/>
						{/* Add preconnect and dns-prefetch for AWS S3 */}
						<link
							rel="preconnect"
							href="https://ds-photo.s3.eu-north-1.amazonaws.com"
							crossOrigin="anonymous"
						/>
						<link
							rel="dns-prefetch"
							href="https://ds-photo.s3.eu-north-1.amazonaws.com"
						/>
					</Helmet>
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{galleryData.map((section, index) => (
						<Link
							to={`/gallery/${section.id}`}
							key={section.id}
							className="relative block group rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
						>
							{section.images && section.images.length > 0 ? (
								<ImageOptimizer
									src={section.images[0].url}
									alt={section.title}
									className="w-full h-64 object-cover"
									sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
									priority={index < 3} // Prioritize first 3 images (visible on most screens)
								/>
							) : (
								<div className="w-full h-64 bg-gray-300 flex items-center justify-center">
									<p>No image available</p>
								</div>
							)}
							<div className="absolute inset-0 flex items-center justify-center">
								<h3 className="dancing-script-gallery-title text-4xl md:text-6xl text-white text-center drop-shadow-lg">
									{section.title}
								</h3>
							</div>
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default GalleryPage;
