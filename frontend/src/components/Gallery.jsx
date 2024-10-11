import React, { useState, useEffect } from 'react';
import { fetchImages } from '../api';

const Gallery = () => {
	const [images, setImages] = useState([]);

	useEffect(() => {
		const getImages = async () => {
			try {
				const { data } = await fetchImages();
				setImages(data);
			} catch (error) {
				console.error('Error fetching images', error);
			}
		};
		getImages();
	}, []);

	return (
		<div className="gallery">
			{images.length > 0 ? (
				images.map((image) => (
					<div key={image._id} className="gallery-item">
						<img src={image.imageUrl} alt={image.title} />
						<h3>{image.title}</h3>
						<p>{image.description}</p>
					</div>
				))
			) : (
				<p>No images found</p>
			)}
		</div>
	);
};

export default Gallery;
