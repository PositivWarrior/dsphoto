import React, { useState } from 'react';
import ImageOptimizer from './ImageOptimizer';
import ImageModal from './ImageModal';

const Gallery = ({ images, categoryFilter }) => {
	const [selectedImage, setSelectedImage] = useState(null);
	const [modalOpen, setModalOpen] = useState(false);

	// Filter images based on category if a filter is provided
	const filteredImages = categoryFilter
		? images.filter((image) => image.category === categoryFilter)
		: images;

	const handleImageClick = (image) => {
		setSelectedImage(image);
		setModalOpen(true);
	};

	const closeModal = () => {
		setModalOpen(false);
	};

	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
				{filteredImages.map((image, index) => (
					<div
						key={image.id || index}
						className="cursor-pointer overflow-hidden rounded-lg shadow-md h-64"
						onClick={() => handleImageClick(image)}
					>
						<ImageOptimizer
							src={image.url}
							alt={image.title || 'Gallery image'}
							className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
							priority={index < 4} // Prioritize first 4 images
						/>
					</div>
				))}
			</div>

			{/* Image Modal for viewing larger images */}
			{modalOpen && selectedImage && (
				<ImageModal image={selectedImage} onClose={closeModal} />
			)}
		</>
	);
};

export default Gallery;
