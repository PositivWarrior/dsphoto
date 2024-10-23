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
							Om meg
						</Link>
						<Link
							to="/contact"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Kontakt
						</Link>
						<Link
							to="/book"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Bestill time
						</Link>
						<Link
							to="/prices"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Priser
						</Link>
						<Link
							to="/gallery"
							className="text-earthyBrown hover:text-lollipop transition-colors"
						>
							Galleriet
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
