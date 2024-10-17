import React, { useState } from 'react';

const Carousel = ({ images }) => {
	const [currentIndex, setCurrentIndex] = useState(0);

	const nextSlide = () => {
		setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
	};

	const prevSlide = () => {
		setCurrentIndex(
			(prevIndex) => (prevIndex - 1 + images.length) % images.length,
		);
	};

	return (
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
						src={image}
						alt={`slide ${index}`}
						className="w-full h-full object-cover"
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
	);
};

export default Carousel;
