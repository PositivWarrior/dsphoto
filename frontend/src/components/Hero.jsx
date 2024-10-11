import React from 'react';

const Hero = () => {
	return (
		<div
			id="landing"
			className="relative h-screen bg-cover bg-center"
			style={{ backgroundImage: `url('https://your-hero-image-url')` }}
		>
			<div className="absolute inset-0 bg-black opacity-50"></div>
			<div className="absolute inset-0 flex items-center justify-center">
				<div className="text-center text-white">
					<h1 className="text-5xl font-bold">
						Capturing Moments That Matter
					</h1>
					<p className="mt-4 text-xl">
						Professional Photography for Every Occasion
					</p>
				</div>
			</div>
		</div>
	);
};

export default Hero;
