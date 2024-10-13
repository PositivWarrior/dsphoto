import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
	return (
		<nav className="fixed top-0 left-0 w-full bg-neutralGray shadow-lg z-50">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="text-2xl font-heading text-lollipop">
						<Link to="/">DS Photo</Link>
					</div>
					<div className="hidden md:flex space-x-6">
						<Link
							to="/about"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							About
						</Link>
						<Link
							to="/contact"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Contact
						</Link>
						<Link
							to="/book"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Book Time
						</Link>
						<Link
							to="/prices"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Prices
						</Link>
						<Link
							to="/gallery"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Gallery
						</Link>
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
