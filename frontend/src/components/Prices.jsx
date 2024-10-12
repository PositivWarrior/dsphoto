import React from 'react';

const Prices = () => {
	return (
		<section id="prices" className="py-20 bg-white text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Pricing
				</h2>
				<p className="text-lg text-gray-600 mb-4">
					Choose a package that fits your needs.
				</p>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Portrait Package
						</h3>
						<p className="text-gray-600 mb-4">
							Perfect for personal portraits and headshots.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							$150
						</p>
					</div>
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Wedding Package
						</h3>
						<p className="text-gray-600 mb-4">
							Capture your special day with a tailored wedding
							package.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							$1200
						</p>
					</div>
					<div className="p-8 border border-gray-300 rounded-lg">
						<h3 className="text-2xl font-bold text-gray-800 mb-4">
							Event Package
						</h3>
						<p className="text-gray-600 mb-4">
							For all other events and occasions.
						</p>
						<p className="text-xl font-semibold text-gray-800">
							$800
						</p>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Prices;
