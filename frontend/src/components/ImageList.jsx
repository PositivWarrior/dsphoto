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
		<div className="bg-white rounded-lg shadow overflow-hidden">
			<table className="min-w-full divide-y divide-gray-200">
				<thead className="bg-gray-50">
					<tr>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Preview
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Category
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Order
						</th>
						<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
							Actions
						</th>
					</tr>
				</thead>
				<tbody className="bg-white divide-y divide-gray-200">
					{images.map((image) => (
						<tr key={image._id} className="hover:bg-gray-50">
							<td className="px-6 py-4 whitespace-nowrap">
								<img
									src={image.url}
									alt={image.title || 'Gallery image'}
									className="h-16 w-24 object-cover rounded"
								/>
							</td>
							<td className="px-6 py-4 whitespace-nowrap">
								<span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
									{image.category}
								</span>
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
								{image.order || 'N/A'}
							</td>
							<td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
								<button
									onClick={() => handleDelete(image._id)}
									className="text-red-600 hover:text-red-900 bg-red-100 hover:bg-red-200 px-3 py-1 rounded-full transition-colors"
								>
									Delete
								</button>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
};

export default ImageList;
