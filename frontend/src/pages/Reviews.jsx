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
		const fetchReviews = async () => {
			try {
				const response = await fetch(
					'http://localhost:8000/api/reviews',
				);
				const data = await response.json();
				setReviews(data.reviews || []);
			} catch (error) {
				console.error('Feil ved henting av anmeldelser:', error);
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
			setError('Vennligst fyll inn alle felter og gi en vurdering.');
			return;
		}
		try {
			const response = await fetch('https://localhost:8000/api/reviews', {
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
				console.error('Kunne ikke legge til anmeldelsen');
			}
		} catch (error) {
			console.error('Feil ved innsending av anmeldelse:', error);
		}
	};

	return (
		<section id="reviews" className="py-20 bg-white text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Omtaler
				</h2>

				<form
					onSubmit={handleAddReview}
					className="max-w-lg mx-auto mb-10"
				>
					<h3 className="text-2xl font-semibold mb-4">
						Legg igjen en omtale
					</h3>
					<div className="mb-4">
						<input
							type="text"
							placeholder="Ditt navn"
							value={newReview.author}
							onChange={(e) =>
								setNewReview({
									...newReview,
									author: e.target.value,
								})
							}
							className="w-full p-4 border border-gray-300 rounded-lg"
							required
						/>
					</div>
					<div className="mb-4">
						<textarea
							placeholder="Din anmeldelse"
							value={newReview.text}
							onChange={(e) =>
								setNewReview({
									...newReview,
									text: e.target.value,
								})
							}
							className="w-full p-4 border border-gray-300 rounded-lg"
							rows="5"
							required
						/>
					</div>
					<div className="mb-4">
						<label className="block text-gray-700 font-medium mb-2">
							Vurdering
						</label>
						<div className="flex justify-center space-x-2">
							{[1, 2, 3, 4, 5].map((star) => (
								<FontAwesomeIcon
									key={star}
									icon={faStar}
									className={`cursor-pointer text-2xl ${
										star <= newReview.rating
											? 'text-yellow-500'
											: 'text-gray-300'
									}`}
									onClick={() => handleStarClick(star)}
								/>
							))}
						</div>
					</div>
					{error && <p className="text-red-500 mb-4">{error}</p>}
					<button
						type="submit"
						className="px-6 py-3 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600"
					>
						Send inn omtale
					</button>
				</form>

				<div className="mt-10 grid gap-6 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
					{reviews.map((review, index) => (
						<div
							key={index}
							className="p-6 bg-gray-100 rounded-lg shadow-md"
						>
							<h4 className="text-lg font-semibold text-gray-800">
								{review.author}
							</h4>
							<div className="flex justify-center my-2">
								{[...Array(5)].map((_, i) => (
									<FontAwesomeIcon
										key={i}
										icon={faStar}
										className={
											i < review.rating
												? 'text-yellow-500'
												: 'text-gray-300'
										}
									/>
								))}
							</div>
							<p className="text-gray-700">{review.text}</p>
						</div>
					))}
				</div>
			</div>
		</section>
	);
};

export default ReviewsPage;
