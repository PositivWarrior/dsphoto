import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GalleryPage = () => {
	const [galleryData, setGalleryData] = useState([]);
	const [loading, setLoading] = useState(true);

	const fetchGalleryData = async () => {
		console.log('Fetching gallery data...');
		try {
			const response = await fetch('http://localhost:8000/api/images');
			const data = await response.json();

			console.log('Data fetched successfully:', data);

			const groupedData = data.reduce((acc, image) => {
				const category = image.category || 'unknown';
				if (!acc[category]) {
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

			console.log('Formatted data:', formattedData);

			setGalleryData(formattedData);
			setLoading(false);
			console.log('Gallery data set successfully.');
		} catch (error) {
			console.error('Error fetching gallery data:', error);
		}
	};

	useEffect(() => {
		fetchGalleryData();
	}, []);

	if (loading) {
		console.log('Loading...');
		return <div>Loading...</div>;
	}

	console.log('Rendering gallery page with data:', galleryData);

	return (
		<div id="gallery" className="py-12 bg-gray-100 mt-20">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-12">
					Explore my latest works
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{galleryData.map((section) => (
						<Link
							to={`/gallery/${section.id}`}
							key={section.id}
							className="relative block group rounded-lg overflow-hidden shadow-lg transform transition-transform hover:scale-105"
						>
							{section.images && section.images.length > 0 ? (
								<img
									src={section.images[0].url}
									alt={section.title}
									className="w-full h-64 object-cover"
								/>
							) : (
								<div className="w-full h-64 bg-gray-300 flex items-center justify-center">
									<p>No image available</p>
								</div>
							)}
						</Link>
					))}
				</div>
			</div>
		</div>
	);
};

export default GalleryPage;
