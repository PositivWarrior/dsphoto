import React from 'react';
// import Gallery from '../components/Gallery';
import Navbar from '../components/Navbar';
import Hero from '../components/Hero';
import About from '../components/About';
import Contact from '../components/Contact';
import BookTime from '../components/BookTime';
import Prices from '../components/Prices';
import GallerySections from '../components/GallerySections';
import ContactForm from '../components/ContactForm';
import Footer from '../components/Footer';

const Home = () => {
	return (
		<div className="bg-neutralGray text-earthyBrown">
			<Navbar />
			<Hero />
			<div className="px-4 sm:px-6 lg:px-8">
				<h1 className="text-5xl font-heading text-center mt-10 mb-4">
					Photographer Portfolio
				</h1>
				<About />
				<Contact />
				<BookTime />
				<Prices />
				{/* <Gallery /> */}
				<GallerySections />
				<ContactForm />
				<Footer />
			</div>
		</div>
	);
};

export default Home;
