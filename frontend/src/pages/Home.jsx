import React from 'react';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import GallerySections from '../components/GallerySections';
import Footer from '../components/Footer';

import { Helmet } from 'react-helmet-async';

const Home = () => {
	return (
		<div className="bg-neutralGray text-earthyBrown">
			<Navbar />
			<Hero />
			<div className="px-4 sm:px-6 lg:px-8">
				<h1 className="text-5xl font-heading text-center mt-10 mb-4">
					<Helmet>
						<title>Dawid Siedlec Photography</title>
						<meta
							name="description"
							content="Oppdag øyeblikk fanget gjennom linsen til Dawid Siedlec."
						/>
						<meta
							name="keywords"
							content="Fotograf, Portrett, Bryllup, Natur, Fredrikstad"
						/>
						<meta name="author" content="Dawid Siedlec" />
					</Helmet>
				</h1>
				<About />
				<GallerySections />
				<Footer />
			</div>
		</div>
	);
};

export default Home;
