import React from 'react';
import Hero from '../components/Hero';
import About from '../components/About';
import GallerySections from '../components/GallerySections';
import { Helmet } from 'react-helmet-async';

const Home = () => {
	return (
		<div className="bg-neutralGray text-earthyBrown">
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
			<Hero />
			<div className="px-4 sm:px-6 lg:px-8">
				<About />
				<GallerySections />
			</div>
		</div>
	);
};

export default Home;
