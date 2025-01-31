import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
	const navigate = useNavigate();
	const heroImageUrl = 'https://dsphoto.onrender.com/assets/Dawid_hero.jpg';

	return (
		<div className="relative h-screen bg-cover bg-center flex items-start md:h-[150vh]">
			<img
				src={heroImageUrl}
				alt="Hero background"
				className="absolute inset-0 w-full h-full object-cover"
				loading="eager"
				fetchpriority="high"
			/>

			<div className="absolute inset-0 bg-[#D19C6A] bg-opacity-60"></div>

			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center text-white">
					<h1 className="text-6xl font-heading">
						Capturing Moments that Matter
					</h1>
					<p className="mt-4 text-xl font-body">
						Let me tell your story through timeless photography.
					</p>
					<button
						onClick={() => navigate('/book')}
						className="mt-8 px-8 py-3 bg-lightAccent text-earthyBrown rounded-lg hover:bg-lollipop hover:text-white transition-all"
					>
						Bestill Time
					</button>
				</div>
			</div>
		</div>
	);
};

export default Hero;
