import React from 'react';
import { useNavigate } from 'react-router-dom';

const Hero = () => {
	const navigate = useNavigate();

	return (
		<div
			className="relative h-screen bg-cover bg-center flex items-start pt-36"
			style={{
				backgroundImage: `url('https://0d7a648345.clvaw-cdnwnd.com/d558e59b0128d2ae079b0ab4f69601a0/200000738-cea37cea38/700/4T5A8707FB.webp?ph=0d7a648345')`,
			}}
		>
			{/* Adding a top margin directly to the image */}
			<div className="absolute inset-0 bg-[#D19C6A] bg-opacity-60"></div>

			{/* Content with margin from the top */}
			<div className="absolute inset-0 flex items-center justify-center mt-20">
				{' '}
				{/* Pushes content down */}
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
