import React from 'react';
import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import GallerySections from '../components/GallerySections';

const Home = () => {
	return (
		<div>
			<Navbar />
			<h1>Photographer Portfolio</h1>
			<Hero />
			<Gallery />
			<GallerySections />
		</div>
	);
};

export default Home;
