import React from 'react';
import galleryData from '../data/galleryData';
import { Link } from 'react-router-dom';

const GalleryPage = () => {
	return (
		<div id="gallery" className="py-12 bg-gray-100 mt-10">
			<div className="max-w-7xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-12">
					Explore my latest works
				</h1>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
					{galleryData.map((section) => (
						<Link
							to={`/gallery/${section.id}`} // Use Link for navigation
							key={section.id}
							className="relative block group"
						>
							<img
								src={section.images[0]} // Display the first image of each category
								alt={section.title}
								className="w-full h-64 object-cover rounded-lg shadow-lg transition-transform transform group-hover:scale-105"
							/>
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

export default GalleryPage;
