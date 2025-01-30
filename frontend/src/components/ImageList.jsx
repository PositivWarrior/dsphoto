import React, { useState, useEffect } from 'react';
import { API } from '../api';
import LoadingSpinner from './LoadingSpinner';

const ImageList = () => {
	const [images, setImages] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		fetchImages();
	}, []);

	const fetchImages = async () => {
		try {
			const response = await API.get('/images');
			setImages(response.data);
			setLoading(false);
		} catch (error) {
			console.error('Error fetching images:', error);
			setLoading(false);
		}
	};

	const handleDelete = async (imageId) => {
		if (window.confirm('Are you sure you want to delete this image?')) {
			try {
				await API.delete(`/images/${imageId}`);
				setImages(images.filter((image) => image._id !== imageId));
			} catch (error) {
				console.error('Error deleting image:', error);
			}
		}
	};

	if (loading) return <LoadingSpinner />;

	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
			{images.map((image) => (
				<div key={image._id} className="relative group">
					<img
						src={image.url}
						alt={image.title || 'Gallery image'}
						className="w-full h-64 object-cover rounded-lg"
					/>
					<div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
						<div className="text-white text-center">
							<p className="mb-2">Category: {image.category}</p>
							<button
								onClick={() => handleDelete(image._id)}
								className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
							>
								Delete
							</button>
						</div>
					</div>
				</div>
			))}
		</div>
	);
};

export default ImageList;
