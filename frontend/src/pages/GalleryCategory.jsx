// src/pages/GalleryCategory.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Carousel from '../components/Carousel';

const GalleryCategory = () => {
	const { category } = useParams();
	const [categoryData, setCategoryData] = useState(null);
	const [loading, setLoading] = useState(true);

	// Fetch images for the selected category
	useEffect(() => {
		const fetchCategoryData = async () => {
			try {
				const response = await fetch(
					'http://localhost:8000/api/images',
				);
				const data = await response.json();

				// Find the category data based on the URL parameter
				const categoryInfo = data.find(
					(section) => section.id === category,
				);
				setCategoryData(categoryInfo);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching category data:', error);
			}
		};

		fetchCategoryData();
	}, [category]);

	if (loading) {
		return <div>Loading...</div>;
	}

	if (!categoryData) {
		return (
			<h2 className="text-center text-red-600 mt-10">
				Category not found
			</h2>
		);
	}

	// Get the first 5 images for the carousel
	const carouselImages = categoryData.images.slice(0, 5);

	return (
		<div className="max-w-7xl mx-auto px-4 py-10 mt-10">
			<h2 className="text-4xl font-bold text-center mb-6 capitalize">
				{categoryData.title} Gallery
			</h2>

			{/* Carousel */}
			{carouselImages.length > 0 && <Carousel images={carouselImages} />}

			{/* Image grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
				{categoryData.images.map((image, index) => (
					<div key={index} className="w-full h-auto">
						<img
							src={image}
							alt={`${categoryData.title} ${index}`}
							className="w-full h-64 object-cover rounded-lg shadow-lg"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default GalleryCategory;
