import React from 'react';
import { useParams } from 'react-router-dom';
import galleryData from '../components/GallerySections';
import Carousel from '../components/Carousel';

const GalleryCategory = () => {
	const { category } = useParams();
	const images = galleryData[category] || [];

	// Get the first 5 images for the carousel
	const carouselImages = images.slice(0, 5);

	return (
		<div className="max-w-7xl mx-auto px-4 py-10 mt-10">
			<h2 className="text-4xl font-bold text-center mb-6 capitalize">
				{category} Gallery
			</h2>

			{/* Carousel */}
			<Carousel images={carouselImages} />

			{/* Image grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
				{images.map((image, index) => (
					<div key={index} className="w-full h-auto">
						<img
							src={image}
							alt={`${category} ${index}`}
							className="w-full h-64 object-cover rounded-lg shadow-lg"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default GalleryCategory;
