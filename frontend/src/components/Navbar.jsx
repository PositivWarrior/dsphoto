import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

	// Add scroll event listener
	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 50);
		};

		window.addEventListener('scroll', handleScroll);
		return () => {
			window.removeEventListener('scroll', handleScroll);
		};
	}, []);

	const toggleMobileMenu = () => {
		setIsMobileMenuOpen(!isMobileMenuOpen);
	};

	const navLinks = [
		{ to: '/about', text: 'Om meg' },
		{ to: '/book', text: 'Bestill time' },
		{ to: '/prices', text: 'Priser' },
		{ to: '/gallery', text: 'Galleriet' },
		{ to: '/reviews', text: 'Omtaler' },
		{ to: '/contact', text: 'Kontakt' },
	];

	return (
		<nav
			className={`fixed top-0 left-0 w-full z-50 transition-colors duration-300 ${
				isScrolled ? 'bg-neutralGray shadow-lg' : 'bg-transparent'
			}`}
		>
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex justify-between items-center h-16">
					<div className="text-2xl font-heading text-lollipop">
						<Link to="/">FotoDS</Link>
					</div>

					{/* Desktop Menu */}
					<div className="hidden md:flex space-x-6">
						{navLinks.map((link) => (
							<Link
								key={link.to}
								to={link.to}
								className="text-earthyBrown hover:text-lollipop transition-colors"
							>
								{link.text}
							</Link>
						))}
					</div>

					{/* Mobile Menu Button */}
					<div className="md:hidden">
						<button
							onClick={toggleMobileMenu}
							className="text-earthyBrown hover:text-lollipop p-2"
							aria-label="Toggle menu"
						>
							<svg
								className="h-6 w-6"
								fill="none"
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth="2"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								{isMobileMenuOpen ? (
									<path d="M6 18L18 6M6 6l12 12" />
								) : (
									<path d="M4 6h16M4 12h16M4 18h16" />
								)}
							</svg>
						</button>
					</div>
				</div>

				{/* Mobile Menu */}
				{isMobileMenuOpen && (
					<div className="md:hidden">
						<div className="px-2 pt-2 pb-3 space-y-1 bg-neutralGray/50 rounded-b-lg">
							{navLinks.map((link) => (
								<Link
									key={link.to}
									to={link.to}
									className="block px-3 py-2 text-earthyBrown hover:text-lollipop transition-colors"
									onClick={() => setIsMobileMenuOpen(false)}
								>
									{link.text}
								</Link>
							))}
						</div>
					</div>
				)}
			</div>
		</nav>
	);
};

export default Navbar;
