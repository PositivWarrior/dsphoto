import React, { useState, useEffect } from 'react';

const Carousel = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalImageIndex, setModalImageIndex] = useState(null); // Track the index of the modal image

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

	// Open modal with selected image (for grid images only)
	const openModal = (index) => {
		setModalImageIndex(index); // Set the modal image to the clicked image index
		setIsModalOpen(true);
	};

	// Close modal
	const closeModal = () => {
		setIsModalOpen(false);
		setModalImageIndex(null); // Reset modal image index on close
	};

	// Navigate to the next image in the modal
	const nextModalImage = (e) => {
		e.stopPropagation(); // Prevent modal close when clicking on arrows
		setModalImageIndex((prevIndex) => (prevIndex + 1) % images.length); // Cycle forward
	};

	// Navigate to the previous image in the modal
	const prevModalImage = (e) => {
		e.stopPropagation(); // Prevent modal close when clicking on arrows
		setModalImageIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length,
		); // Cycle backward
	};

	return (
		<div>
			{/* Modal for enlarging image */}
			{isModalOpen && (
				<div
					className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
					onClick={closeModal} // Close modal when clicking outside image
				>
					<img
						src={images[modalImageIndex].url} // Show the modal image based on the index
						alt="Enlarged"
						className="w-auto max-w-full h-auto max-h-full object-contain rounded-lg"
						style={{ margin: '40px auto', maxHeight: '80vh' }} // Added margin on top and bottom
					/>

					{/* Arrows for navigating the modal images */}
					<button
						onClick={prevModalImage} // Navigate to the previous modal image
						className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-black p-2 rounded-full"
					>
						←
					</button>
					<button
						onClick={nextModalImage} // Navigate to the next modal image
						className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-50 hover:bg-opacity-100 text-black p-2 rounded-full"
					>
						→
					</button>
				</div>
			)}

			{/* Carousel */}
			<div
				className="relative w-full h-[500px] overflow-hidden rounded-lg shadow-lg"
				// style={{
				// 	marginTop: '30px',
				// 	marginBottom: '30px',
				// 	borderRadius: '15px', // Add rounded corners
				// }}
			>
				{/* Images (no clickability on carousel images) */}
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
							className="w-full h-full object-contain rounded-lg"
							// style={{
							// 	marginTop: '20px',
							// 	marginBottom: '20px', // Add margin on top and bottom
							// 	borderRadius: '15px', // Add rounded corners to images
							// }}
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

			{/* Grid below the carousel (clickable images) */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
				{images.map((image, index) => (
					<div
						key={index}
						className="w-full h-auto cursor-pointer"
						onClick={() => openModal(index)} // Open modal for grid images, using the image index
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
