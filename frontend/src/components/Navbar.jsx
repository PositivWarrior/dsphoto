import React from 'react';

const Navbar = () => {
	return (
		<nav className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="text-2xl font-bold">
						<a href="#landing">Photographer Name</a>
					</div>
					<div className="space-x-6">
						<a
							href="#about"
							className="text-gray-700 hover:text-gray-900"
						>
							About
						</a>
						<a
							href="#contact"
							className="text-gray-700 hover:text-gray-900"
						>
							Contact
						</a>
						<a
							href="#book"
							className="text-gray-700 hover:text-gray-900"
						>
							Book Time
						</a>
						<a
							href="#prices"
							className="text-gray-700 hover:text-gray-900"
						>
							Prices
						</a>
						<a
							href="#gallery"
							className="text-gray-700 hover:text-gray-900"
						>
							Gallery
						</a>
					</div>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
