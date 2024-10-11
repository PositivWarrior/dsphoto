import React from 'react';

const Navbar = () => {
	return (
		<nav className="fixed top-0 left-0 w-full bg-neutralGray shadow-lg z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="text-2xl font-heading text-lollipop">
						<a href="#landing">DS Photo</a>
					</div>
					<div className="hidden md:flex space-x-6">
						<a
							href="#about"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							About
						</a>
						<a
							href="#contact"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Contact
						</a>
						<a
							href="#book"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Book Time
						</a>
						<a
							href="#prices"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Prices
						</a>
						<a
							href="#gallery"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Gallery
						</a>
					</div>
					{/* Add a mobile menu button for smaller screens */}
					<div className="md:hidden">
						<button className="text-lollipop">Menu</button>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
