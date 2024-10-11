import React from 'react';

const Footer = () => {
	return (
		<footer className="bg-gray-900 text-white py-6">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex flex-col items-center">
					<p className="text-center">
						&copy; {new Date().getFullYear()} Kacper Margol. All
						rights reserved.
					</p>
					<div className="mt-4 space-x-6">
						<a
							href="https://positivwarrior.github.io/Portfolio/"
							target="_blank"
							rel="noopener noreferrer"
						>
							Portfolio
						</a>
						<a
							href="https://www.linkedin.com/in/kacper-margol-545493195/"
							target="_blank"
							rel="noopener noreferrer"
						>
							LinkedIn
						</a>
						<a
							href="https://github.com/PositivWarrior"
							target="_blank"
							rel="noopener noreferrer"
						>
							GitHub
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
