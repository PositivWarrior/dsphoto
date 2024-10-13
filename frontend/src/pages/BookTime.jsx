import React from 'react';

const BookTimePage = () => {
	return (
		<section id="book" className="py-20 bg-gray-100 text-center">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				<h2 className="text-4xl font-bold text-gray-800 mb-8">
					Book a Session
				</h2>
				<p className="text-lg text-gray-600 mb-4">
					Interested in booking a session? Select a date and let's get
					started!
				</p>
				<form className="max-w-lg mx-auto">
					<div className="mb-4">
						<input
							type="date"
							className="w-full p-4 border border-gray-300 rounded-lg"
						/>
					</div>
					<button className="px-6 py-3 bg-lollipop text-white font-semibold rounded-lg">
						Book Now
					</button>
				</form>
			</div>
		</section>
	);
};

export default BookTimePage;
