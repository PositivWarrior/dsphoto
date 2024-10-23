import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const GallerySections = () => {
	const [galleryData, setGalleryData] = useState([]);
	const [loading, setLoading] = useState(true);

	// Fetch all categories and images
	useEffect(() => {
		const fetchGalleryData = async () => {
			try {
				const response = await fetch(
					'http://localhost:8000/api/images',
				);
				const data = await response.json();

				// Group images by category
				const groupedData = data.reduce((acc, image) => {
					// Ensure category is valid
					const category = image.category;
					if (!acc[category]) {
						acc[category] = [];
					}
					acc[category].push(image);
					return acc;
				}, {});

				const formattedData = Object.keys(groupedData).map(
					(category) => ({
						id: category,
						title:
							category.charAt(0).toUpperCase() +
							category.slice(1),
						images: groupedData[category],
					}),
				);

				setGalleryData(formattedData);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching gallery data:', error);
			}
		};

		fetchGalleryData();
	}, []);

	if (loading) {
		return <div>Loading...</div>;
	}

	return (
		<div id="gallery" className="py-12 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-12">
					Explore My Latest Works
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{galleryData.map((section) => (
						<Link
							to={`/gallery/${section.id}`}
							key={section.id}
							className="relative block group"
						>
							{/* Only render image if images array exists and has at least one image */}
							{section.images && section.images.length > 0 ? (
								<img
									src={section.images[0].url} // Fetch the first image of the category from the API data
									alt={section.title}
									className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform transform group-hover:scale-105"
								/>
							) : (
								<div className="w-full h-64 bg-gray-300 rounded-lg flex items-center justify-center">
									<p>No image available</p>
								</div>
							)}

							<div className="absolute inset-0 bg-black bg-opacity-0 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
								<h3 className="text-2xl font-bold text-white">
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

export default GallerySections;
