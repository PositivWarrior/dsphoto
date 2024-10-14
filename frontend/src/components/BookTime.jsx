import React, { useState } from 'react';

const BookTime = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		date: '',
		message: '',
	});
	const [successMessage, setSuccessMessage] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({ ...formData, [name]: value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();

		try {
			const response = await fetch('/api/bookings', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setSuccessMessage(
					'Your request has been submitted successfully!',
				);
				setFormData({ name: '', email: '', date: '', message: '' });
			} else {
				setSuccessMessage(
					'Error submitting request. Please try again.',
				);
			}
		} catch (error) {
			setSuccessMessage('Error submitting request. Please try again.');
		}
	};

	return (
		<section className="py-12 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-center mb-8">
					Book a Session
				</h2>
				<form
					onSubmit={handleSubmit}
					className="max-w-lg mx-auto bg-white p-6 shadow-lg rounded-lg"
				>
					<div className="mb-4">
						<input
							type="text"
							name="name"
							placeholder="Your Name"
							value={formData.name}
							onChange={handleChange}
							required
							className="w-full p-4 border border-gray-300 rounded-lg"
						/>
					</div>
					<div className="mb-4">
						<input
							type="email"
							name="email"
							placeholder="Your Email"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full p-4 border border-gray-300 rounded-lg"
						/>
					</div>
					<div className="mb-4">
						<input
							type="date"
							name="date"
							value={formData.date}
							onChange={handleChange}
							required
							className="w-full p-4 border border-gray-300 rounded-lg"
						/>
					</div>
					<div className="mb-4">
						<textarea
							name="message"
							placeholder="Additional Notes (Optional)"
							value={formData.message}
							onChange={handleChange}
							className="w-full p-4 border border-gray-300 rounded-lg"
							rows="5"
						></textarea>
					</div>
					<button
						type="submit"
						className="w-full px-4 py-3 bg-lollipop text-white rounded-lg hover:bg-earthyBrown transition-all"
					>
						Submit Request
					</button>
					{successMessage && (
						<p className="mt-4 text-green-500">{successMessage}</p>
					)}
				</form>
			</div>
		</section>
	);
};

export default BookTime;
