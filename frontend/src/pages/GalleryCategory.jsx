// src/pages/GalleryCategory.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Carousel from '../components/Carousel';
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import { API } from '../api'; // Import the API instance

const IMAGES_PER_PAGE = 6; // Adjust this number as needed

const GalleryCategory = () => {
	const { category } = useParams();
	const [categoryData, setCategoryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [displayedImages, setDisplayedImages] = useState([]);
	const [showMore, setShowMore] = useState(false);
	const location = useLocation(); // Add this
	const isAdminRoute = location.pathname.includes('/admin'); // Check if we're in admin route

	useEffect(() => {
		const fetchCategoryData = async () => {
			try {
				const response = await API.get(`/images?category=${category}`); // Use API instance
				const data = response.data; // Access data from response.data

				// Format and sort images by order
				const formattedCategoryData = {
					title: category.charAt(0).toUpperCase() + category.slice(1),
					images: data.sort(
						(a, b) => (a.order ?? 0) - (b.order ?? 0),
					),
				};

				setCategoryData(formattedCategoryData);
				setDisplayedImages(
					formattedCategoryData.images.slice(0, IMAGES_PER_PAGE),
				);
				setLoading(false);
			} catch (error) {
				console.error('Error fetching category data:', error);
			}
		};

		fetchCategoryData();
	}, [category, location.pathname]); // Add location.pathname as dependency

	const handleShowMore = () => {
		setShowMore(true);
		setDisplayedImages(categoryData.images);
	};

	if (loading) return <LoadingSpinner />;

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
				<Helmet>
					<title>
						{isAdminRoute
							? 'Admin Panel | Dawid Siedlec'
							: `${categoryData?.title} Galleri | Dawid Siedlec`}
					</title>
					<meta
						name="description"
						content={`Utforsk ${categoryData?.title}-bilder av høy kvalitet.`}
					/>
				</Helmet>
			</h2>

			{/* Carousel */}
			{displayedImages.length > 0 && (
				<Carousel images={displayedImages} />
			)}

			{/* Show More Button */}
			{!showMore && categoryData.images.length > IMAGES_PER_PAGE && (
				<div className="text-center mt-8">
					<button
						onClick={handleShowMore}
						className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
					>
						Vis mer
					</button>
				</div>
			)}
		</div>
	);
};

export default GalleryCategory;
