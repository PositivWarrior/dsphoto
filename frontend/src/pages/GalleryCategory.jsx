import React from 'react';
import { useParams } from 'react-router-dom';
import galleryData from '../components/GallerySections'; // Ensure correct import
import Carousel from '../components/Carousel';

const GalleryCategory = () => {
	const { category } = useParams();

	// Use .filter() to find the category (returns an array)
	const filteredCategoryData = galleryData.filter(
		(section) => section.id === category,
	);

	// If no matching category is found, return an error message
	if (filteredCategoryData.length === 0) {
		return (
			<h2 className="text-center text-red-600 mt-10">
				Category not found
			</h2>
		);
	}

	// Since .filter() returns an array, get the first element
	const categoryData = filteredCategoryData[0];

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
