import React, { useState, useEffect } from 'react';

const Carousel = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalImage, setModalImage] = useState(null);

	// Automatically move to the next slide every 3 seconds
	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
		}, 3000); // 3 seconds interval

		// Clean up interval on unmount
		return () => clearInterval(interval);
	}, [images.length]);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length,
		);
	};

	// Open modal with selected image
	const openModal = (image) => {
		setModalImage(image);
		setIsModalOpen(true);
	};

	// Close modal
	const closeModal = () => {
		setIsModalOpen(false);
		setModalImage(null);
	};

	return (
		<div>
			{/* Modal for enlarging image */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
					onClick={closeModal} // Close modal when clicking outside image
				>
					<img
						src={modalImage}
						alt="Enlarged"
						className="w-9/12 h-9/12 object-contain"
					/>
				</div>
			)}

			{/* Carousel */}
			<div className="relative w-full h-80 overflow-hidden rounded-lg shadow-lg">
				{/* Images */}
				{images.map((image, index) => (
					<div
						key={index}
						className={`absolute inset-0 transition-opacity duration-1000 ${
							index === currentIndex ? 'opacity-100' : 'opacity-0'
						}`}
					>
						<img
							src={image.url}
							alt={`slide ${index}`}
							className="w-full h-full object-cover cursor-pointer"
						/>
					</div>
				))}

				{/* Controls */}
				<button
					onClick={prevSlide}
					className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-full p-2"
				>
					←
				</button>
				<button
					onClick={nextSlide}
					className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 rounded-full p-2"
				>
					→
				</button>
			</div>

			{/* Grid below the carousel */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
				{images.map((image, index) => (
					<div
						key={index}
						className="w-full h-auto cursor-pointer"
						onClick={() => openModal(image.url)} // Open modal for grid images as well
					>
						<img
							src={image.url}
							alt={`grid ${index}`}
							className="w-full h-64 object-cover rounded-lg shadow-lg"
						/>
					</div>
				))}
			</div>
		</div>
	);
};

export default Carousel;
