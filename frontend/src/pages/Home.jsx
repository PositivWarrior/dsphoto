import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import GallerySections from '../components/GallerySections';
import Footer from '../components/Footer';

const Home = () => {
	return (
		<div className="bg-neutralGray text-earthyBrown">
			<Navbar />
			<Hero />
			<div className="px-4 sm:px-6 lg:px-8">
				<h1 className="text-5xl font-heading text-center mt-10 mb-4">
					Dawid Siedlec Photography
				</h1>
				<About />
				<GallerySections />
				<Footer />
			</div>
		</div>
	);
};

export default Home;
