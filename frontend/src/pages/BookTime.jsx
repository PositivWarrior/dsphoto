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

		// Template parameters for EmailJS
		const templateParams = {
			from_name: name,
			from_email: email,
			booking_date: date,
			message: message,
		};

		// Send email using EmailJS
		try {
			await emailjs.send(
				'service_rn45rec', // EmailJS service ID
				'template_t3sedmj', // EmailJS template ID
				templateParams, // Template parameters
				'ouIL0a7IpDVcizQLE', // Public Key (User ID)
			);
			setStatus('Bookingforespørsel sendt!');
		} catch (error) {
			console.error('EmailJS Error:', error);
			setStatus('Kunne ikke sende bookingforespørsel.');
			return;
		}

		// Send booking request to the backend (if necessary)
		try {
			const response = await fetch(
				'https://localhost:8000/api/bookings',
				{
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
				},
			);

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Feil ${response.status}: ${errorText}`);
			}

			setStatus('Bookingforespørsel lagret!');
		} catch (error) {
			console.error('Error on sending to backend:', error);
			setStatus('Kunne ikke lagre bookingforespørselen.');
		}

		// Reset form fields
		setName('');
		setEmail('');
		setDate('');
		setMessage('');
	};

	return (
		<div className="max-w-md mx-auto p-8 bg-white shadow-lg rounded-lg mt-16">
			<h2 className="text-2xl font-bold mb-6">Bestill en Time</h2>
			<form onSubmit={handleSubmit} className="space-y-6">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Navn
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
						E-post
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
						Dato
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
						Melding
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
					Send Bookingforespørsel
				</button>
				{status && <p className="mt-4 text-green-500">{status}</p>}
			</form>
		</div>
	);
};

export default BookTime;
