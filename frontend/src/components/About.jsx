import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

const About = () => {
	return (
		<section id="about" className="py-20 bg-gray-100 text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Om meg
				</h2>
				<p className="text-lg text-gray-600">
					Jeg er en lidenskapelig fotograf med mange års erfaring i å
					fange livets vakreste øyeblikk. Målet mitt er å fortelle din
					historie gjennom mitt kameraobjektiv, enten det er
					bryllupsdagen din, et portrett eller et personlig prosjekt.
				</p>

				{/* Centered Social Media Icons */}
				<div className="flex justify-center space-x-6 mt-4">
					<a
						href="https://www.instagram.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-500 hover:text-pink-600"
						aria-label="Follow us on Instagram"
					>
						<FontAwesomeIcon icon={faInstagram} size="2x" />
					</a>
					<a
						href="https://www.facebook.com/yourusername"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-500 hover:text-blue-600"
						aria-label="Follow us on Facebook"
					>
						<FontAwesomeIcon icon={faFacebook} size="2x" />
					</a>
				</div>
			</div>
		</section>
	);
};

export default About;
