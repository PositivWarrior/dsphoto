import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const BookTime = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [date, setDate] = useState('');
	const [message, setMessage] = useState('');
	const [status, setStatus] = useState('');

	const handleSubmit = async (e) => {
		e.preventDefault();

		// EmailJS configuration with template parameters
		const templateParams = {
			from_name: name,
			from_email: email,
			booking_date: date,
			message: message,
		};

		// Send email using EmailJS
		try {
			await emailjs.send(
				'service_rn45rec',
				'template_t3sedmj',
				templateParams,
				'ouIL0a7IpDVcizQLE',
			);
			setStatus('Booking request sent successfully!');
		} catch (error) {
			console.error('EmailJS Error:', error);
			setStatus('Failed to send booking request.');
			return;
		}

		// Send booking request to the backend
		try {
			console.log('Sending booking to backend:', {
				name,
				email,
				date,
				message,
			});

			const response = await fetch('http://localhost:8000/api/bookings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name,
					email,
					date,
					message,
				}),
			});

			if (!response.ok) {
				// Handle error responses
				const errorText = await response.text(); // Check the response body if not valid JSON
				throw new Error(`Error ${response.status}: ${errorText}`);
			}

			// const data = await response.json();
			setStatus('Booking request successfully saved!');
		} catch (error) {
			console.error('Error saving booking to the backend:', error);
			setStatus('Failed to save booking request.');
		}

		// Reset form fields
		setName('');
		setEmail('');
		setDate('');
		setMessage('');
	};

	return (
		<div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg">
			<h2 className="text-2xl font-bold mb-6">Book a Session</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Name
					</label>
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Email
					</label>
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Date
					</label>
					<input
						type="date"
						value={date}
						onChange={(e) => setDate(e.target.value)}
						required
						className="w-full p-3 border border-gray-300 rounded-lg"
					/>
				</div>
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Message
					</label>
					<textarea
						value={message}
						onChange={(e) => setMessage(e.target.value)}
						className="w-full p-3 border border-gray-300 rounded-lg"
						rows="4"
					></textarea>
				</div>
				<button
					type="submit"
					className="w-full bg-lollipop text-white py-3 rounded-lg hover:bg-earthyBrown transition-all"
				>
					Submit Booking
				</button>
				{status && <p className="mt-4 text-green-500">{status}</p>}
			</form>
		</div>
	);
};

export default BookTime;
