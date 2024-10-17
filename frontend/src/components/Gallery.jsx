import React, { useState, useEffect } from 'react';
import { fetchImages } from '../api';
import { Link } from 'react-router-dom';
import galleryData from '../components/GallerySections';

const Gallery = () => {
	return (
		<div className="max-w-7xl mx-auto px-4 py-10">
			<h2 className="text-4xl font-bold text-center mb-6">Gallery</h2>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{Object.keys(galleryData).map((category) => (
					<Link
						key={category}
						to={`/gallery/${category}`}
						className="block relative group"
					>
						<img
							src={galleryData[category][0]} // First image as category thumbnail
							alt={category}
							className="w-full h-64 object-cover rounded-lg shadow-lg"
						/>
						<div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
							<h3 className="text-2xl font-bold text-white capitalize">
								{category}
							</h3>
						</div>
					</Link>
				))}
			</div>
		</div>
	);
};
export default Gallery;
