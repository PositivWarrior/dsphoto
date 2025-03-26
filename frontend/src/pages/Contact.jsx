import React, { useState } from 'react';
import emailjs from 'emailjs-com';

const Contact = () => {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		message: '',
	});
	const [successMessage, setSuccessMessage] = useState('');

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData({
			...formData,
			[name]: value,
		});
	};

	const sendEmail = (e) => {
		e.preventDefault();

		const templateParams = {
			from_name: formData.name,
			from_email: formData.email,
			message: formData.message,
		};

		emailjs
			.send(
				'service_y1tvzoi', //  Service ID
				'template_dewkewe', // Template ID
				templateParams, // Template parameters
				'ouIL0a7IpDVcizQLE', // Public Key
			)
			.then(
				(response) => {
					console.log('SUCCESS!', response.status, response.text);
					setSuccessMessage('Meldingen ble sendt!');
				},
				(error) => {
					console.log('FAILED...', error);
					setSuccessMessage(
						'Kunne ikke sende meldingen. Vennligst prøv igjen.',
					);
				},
			);

		setFormData({ name: '', email: '', message: '' });
	};

	return (
		<section id="contact" className="py-20 bg-white text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Kontakt
				</h2>
				<p className="text-lg text-gray-600 mb-4">
					Har du noen spørsmål? Ta gjerne kontakt med meg.
				</p>
				<form onSubmit={sendEmail} className="max-w-lg mx-auto">
					<div className="mb-4">
						<input
							type="text"
							name="name"
							placeholder="Ditt navn"
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
							placeholder="Din e-post"
							value={formData.email}
							onChange={handleChange}
							required
							className="w-full p-4 border border-gray-300 rounded-lg"
						/>
					</div>
					<div className="mb-4">
						<textarea
							name="message"
							placeholder="Din melding"
							value={formData.message}
							onChange={handleChange}
							required
							className="w-full p-4 border border-gray-300 rounded-lg"
							rows="5"
						/>
					</div>
					<button className="px-6 py-3 bg-lollipop text-white font-semibold rounded-lg">
						Send melding
					</button>
				</form>
				{successMessage && (
					<p className="mt-4 text-lg text-green-500">
						{successMessage}
					</p>
				)}
			</div>
		</section>
	);
};

export default Contact;
