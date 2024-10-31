// src/pages/GalleryCategory.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Carousel from '../components/Carousel';

const GalleryCategory = () => {
	const { category } = useParams();
	const [categoryData, setCategoryData] = useState(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchCategoryData = async () => {
			try {
				const response = await fetch(
					`http://localhost:8000/api/images?category=${category}`,
				);
				const data = await response.json();

				// Format and sort images by order
				const formattedCategoryData = {
					title: category.charAt(0).toUpperCase() + category.slice(1),
					images: data.sort(
						(a, b) => (a.order ?? 0) - (b.order ?? 0),
					),
				};

				setCategoryData(formattedCategoryData);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching category data:', error);
			}
		};

		fetchCategoryData();
	}, [category]);

	if (loading) return <div>Loading...</div>;

	if (!categoryData) {
		return (
			<h2 className="text-center text-red-600 mt-10">
				Category not found
			</h2>
		);
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-10 mt-10">
			<h2 className="text-4xl font-bold text-center mb-6 capitalize">
				{categoryData.title} Gallery
			</h2>

			{/* Carousel */}
			{categoryData.images.length > 0 && (
				<Carousel images={categoryData.images} />
			)}
		</div>
	);
};

export default GalleryCategory;
