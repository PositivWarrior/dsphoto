import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
	const [isOpen, setIsOpen] = useState(false);

	// Toggle the hamburger menu
	const toggleMenu = () => {
		setIsOpen(!isOpen);
	};

	// Close the menu when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			// Close the menu if clicking outside of the navbar or menu
			if (!event.target.closest('nav')) {
				setIsOpen(false);
			}
		};

		// Add event listener when the menu is open
		if (isOpen) {
			document.addEventListener('mousedown', handleClickOutside);
		} else {
			document.removeEventListener('mousedown', handleClickOutside);
		}

		// Cleanup event listener on unmount
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [isOpen]);

	return (
		<nav className="fixed top-0 left-0 w-full bg-transparent z-50">
			{' '}
			{/* Transparent background */}
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="text-2xl font-heading text-lollipop">
						<Link to="/">DS Photo</Link>
					</div>
					{/* Mobile menu button */}
					<div className="md:hidden">
						<button
							onClick={toggleMenu}
							className="text-lollipop focus:outline-none"
						>
							{/* Hamburger icon */}
							<svg
								className="w-6 h-6"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M4 6h16M4 12h16m-7 6h7"
								></path>
							</svg>
						</button>
					</div>
					{/* Links for desktop view */}
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
				</div>
				{/* Mobile menu */}
				<div
					className={`${
						isOpen ? 'block' : 'hidden'
					} md:hidden mt-2 space-y-2 bg-neutralGray bg-opacity-80 p-4 rounded-lg`}
				>
					<Link
						to="/about"
						className="block text-earthyBrown hover:text-lollipop transition-colors"
						onClick={toggleMenu} // Close menu on link click
					>
						Om meg
					</Link>
					<Link
						to="/contact"
						className="block text-earthyBrown hover:text-lollipop transition-colors"
						onClick={toggleMenu}
					>
						Kontakt
					</Link>
					<Link
						to="/book"
						className="block text-earthyBrown hover:text-lollipop transition-colors"
						onClick={toggleMenu}
					>
						Bestill time
					</Link>
					<Link
						to="/prices"
						className="block text-earthyBrown hover:text-lollipop transition-colors"
						onClick={toggleMenu}
					>
						Priser
					</Link>
					<Link
						to="/gallery"
						className="block text-earthyBrown hover:text-lollipop transition-colors"
						onClick={toggleMenu}
					>
						Galleriet
					</Link>
				</div>
			</div>
		</nav>
	);
};

export default Navbar;
