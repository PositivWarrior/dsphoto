import React from 'react';

const GalleryPage = () => {
	return (
		<section id="gallery" className="py-20 bg-white text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Gallery
				</h2>
				<p className="text-lg text-gray-600 mb-4">
					Explore some of my recent work below.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="h-64 bg-gray-300">Image 1</div>
					<div className="h-64 bg-gray-300">Image 2</div>
					<div className="h-64 bg-gray-300">Image 3</div>
					<div className="h-64 bg-gray-300">Image 4</div>
					<div className="h-64 bg-gray-300">Image 5</div>
					<div className="h-64 bg-gray-300">Image 6</div>
				</div>
			</div>
		</section>
	);
};

export default GalleryPage;
