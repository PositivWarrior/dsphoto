// src/pages/GalleryCategory.jsx
import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, useLocation } from 'react-router-dom';
// import Carousel from '../components/Carousel'; // Import lazily now
import { Helmet } from 'react-helmet-async';
import LoadingSpinner from '../components/LoadingSpinner';
import { API } from '../api'; // Import the API instance

// Lazy load the Carousel component
const LazyCarousel = lazy(() => import('../components/Carousel'));

const IMAGES_PER_PAGE = 6; // Adjust this number as needed

const GalleryCategory = () => {
	const { category } = useParams();
	const [categoryData, setCategoryData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [displayedImages, setDisplayedImages] = useState([]);
	const [currentPage, setCurrentPage] = useState(1);
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
				console.error('Error fetching gallery data:', error);
			}
		};

		fetchCategoryData();
		setCurrentPage(1); // Reset page when category changes
	}, [category, location.pathname]); // Add location.pathname as dependency

	const handleShowMore = () => {
		const nextPage = currentPage + 1;
		const startIndex = 0;
		const endIndex = nextPage * IMAGES_PER_PAGE;

		setDisplayedImages(categoryData.images.slice(startIndex, endIndex));
		setCurrentPage(nextPage);
	};

	const hasMoreImages = categoryData?.images.length > displayedImages.length;

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
					{/* Add preconnect and dns-prefetch for AWS S3 */}
					<link
						rel="preconnect"
						href="https://ds-photo.s3.eu-north-1.amazonaws.com"
						crossOrigin="anonymous"
					/>
					<link
						rel="dns-prefetch"
						href="https://ds-photo.s3.eu-north-1.amazonaws.com"
					/>
				</Helmet>
			</h2>

			{/* Carousel - Lazy loaded */}
			{displayedImages.length > 0 && (
				<Suspense fallback={<LoadingSpinner />}>
					<LazyCarousel images={displayedImages} />
				</Suspense>
			)}

			{/* Show More Button */}
			{hasMoreImages && (
				<div className="text-center mt-8">
					<button
						onClick={handleShowMore}
						className="bg-gray-800 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
					>
						Vis {IMAGES_PER_PAGE} mer ({displayedImages.length} av{' '}
						{categoryData.images.length})
					</button>
				</div>
			)}
		</div>
	);
};

export default GalleryCategory;
