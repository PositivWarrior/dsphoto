// src/pages/ReviewsPage.jsx
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const ReviewsPage = () => {
	const [reviews, setReviews] = useState([]);
	const [newReview, setNewReview] = useState({
		author: '',
		rating: 0,
		text: '',
	});
	const [error, setError] = useState('');

	useEffect(() => {
		// Fetch all reviews
		const fetchReviews = async () => {
			try {
				const response = await fetch(
					'http://localhost:8000/api/reviews',
				);
				const data = await response.json();
				setReviews(data.reviews || []);
			} catch (error) {
				console.error('Error fetching reviews:', error);
			}
		};

		fetchReviews();
	}, []);

	const handleStarClick = (rating) => {
		setNewReview({ ...newReview, rating });
	};

	const handleAddReview = async (e) => {
		e.preventDefault();
		if (!newReview.author || !newReview.rating || !newReview.text) {
			setError('Please fill in all fields and provide a rating.');
			return;
		}

		try {
			const response = await fetch('http://localhost:8000/api/reviews', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newReview),
			});

			if (response.ok) {
				const addedReview = await response.json();
				setReviews([...reviews, addedReview]);
				setNewReview({ author: '', rating: 0, text: '' });
				setError('');
			} else {
				console.error('Failed to add review');
			}
		} catch (error) {
			console.error('Error adding review:', error);
		}
	};

	return (
		<section id="reviews" className="py-12 bg-gray-100">
			<div className="max-w-5xl mx-auto px-4">
				<h1 className="text-4xl font-bold text-center mb-8">Reviews</h1>

				{/* Review Submission Form */}
				<form onSubmit={handleAddReview} className="mb-8">
					<h2 className="text-2xl font-semibold mb-4">
						Leave a Review
					</h2>
					<div className="mb-4">
						<label className="block text-gray-700">Author</label>
						<input
							type="text"
							className="w-full p-2 border border-gray-300 rounded"
							value={newReview.author}
							onChange={(e) =>
								setNewReview({
									...newReview,
									author: e.target.value,
								})
							}
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Review</label>
						<textarea
							className="w-full p-2 border border-gray-300 rounded"
							value={newReview.text}
							onChange={(e) =>
								setNewReview({
									...newReview,
									text: e.target.value,
								})
							}
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700">Rating</label>
						<div className="flex space-x-1">
							{[1, 2, 3, 4, 5].map((star) => (
								<FontAwesomeIcon
									key={star}
									icon={faStar}
									className={`cursor-pointer ${
										star <= newReview.rating
											? 'text-yellow-500'
											: 'text-gray-300'
									}`}
									onClick={() => handleStarClick(star)}
								/>
							))}
						</div>
					</div>
					{error && <p className="text-red-600 mb-4">{error}</p>}
					<button
						type="submit"
						className="px-4 py-2 bg-blue-500 text-white rounded"
					>
						Submit Review
					</button>
				</form>

				{/* Display Reviews */}
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{reviews.map((review, index) => (
						<div
							key={index}
							className="p-6 bg-white rounded shadow"
						>
							<h3 className="text-lg font-semibold">
								{review.author}
							</h3>
							<p className="text-yellow-500">
								{'★'.repeat(review.rating)}{' '}
								{'☆'.repeat(5 - review.rating)}
							</p>
							<p className="text-gray-700 mt-2">{review.text}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ReviewsPage;
