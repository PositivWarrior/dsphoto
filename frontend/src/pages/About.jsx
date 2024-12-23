import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faFacebook } from '@fortawesome/free-brands-svg-icons';

const AboutPage = () => {
	return (
		<section id="about" className="py-20 bg-gray-100">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center">
				{/* Image on the left side */}
				<div className="md:w-1/2 mb-8 md:mb-0">
					<img
						src="http://localhost:8000/assets/Dawid_hero.jpg"
						alt="Fotograf"
						className="w-full h-auto rounded-lg shadow-lg"
					/>
				</div>

				{/* Description on the right side */}
				<div className="md:w-1/2 md:pl-12">
					<h2 className="text-4xl font-bold text-gray-800 mb-6">
						Om Meg
					</h2>
					<p className="text-lg text-gray-600 mb-6">
						Hei!
						<br /> Jeg heter Dawid. Jeg er 37 år gammel og det er
						utrolig kjekt at du besøker siden min! <br />
						Jeg elsker natur, rock'n'roll og gitaren min, men av
						alle interesser er fotografien den største. Jeg bor
						sammen med min kjære kone og sønn i Fredrikstad, men
						reiser gjerne rund for å fotografere deg og familien din
						i naturen eller dokumentere viktige begivenheter i deres
						liv for eksempel et bryllup. <br />
						Jeg fotograferer natur, arkitektur, dyr... men det som
						fascinerer meg mest er å ta bilder av mennesker. En
						portrett eller gruppebilde forteller en historie, viser
						ikke bare utseende, men trekker fram personligheten, det
						som er helt unik i hver enkelt. <br />
						Det finnes ikke to like personer og det finnes heller
						ikke to like portretter. Jeg liker å bli kjent med de,
						som skal bli fotografert. Jeg vil forstå deres ønsker og
						behov, komme med innspill... slik at vi kan sammen skape
						en vakker og varig minne i bilder.
					</p>

					{/* Social Media Icons */}
					<div className="flex space-x-6 mt-4">
						<a
							href="https://www.instagram.com/yourusername"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-pink-600"
						>
							<FontAwesomeIcon icon={faInstagram} size="2x" />
						</a>
						<a
							href="https://www.facebook.com/yourusername"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-500 hover:text-blue-600"
						>
							<FontAwesomeIcon icon={faFacebook} size="2x" />
						</a>
					</div>
				</div>
			</div>
		</section>
	);
};

export default AboutPage;
