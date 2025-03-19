import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import components directly for now to debug
import Layout from './components/Layout';
import Home from './pages/Home';
import GalleryPage from './pages/Gallery';
import GalleryCategory from './pages/GalleryCategory';
import AboutPage from './pages/About';
import ContactPage from './pages/Contact';
import LoginPage from './pages/Login';
import Admin from './pages/Admin';
import BookTimePage from './pages/BookTime';
import PricesPage from './pages/Prices';
import ReviewsPage from './pages/Reviews';

// Debug log to check rendering
console.log('App component loading...');

function App() {
	console.log('App component rendering...');
	return (
		<div className="App">
			<Layout>
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/gallery" element={<GalleryPage />} />
					<Route
						path="/gallery/:category"
						element={<GalleryCategory />}
					/>
					<Route path="/about" element={<AboutPage />} />
					<Route path="/contact" element={<ContactPage />} />
					<Route path="/login" element={<LoginPage />} />
					<Route path="/admin/*" element={<Admin />} />
					<Route path="/book" element={<BookTimePage />} />
					<Route path="/prices" element={<PricesPage />} />
					<Route path="/reviews" element={<ReviewsPage />} />
					<Route path="*" element={<Navigate to="/" replace />} />
				</Routes>
			</Layout>
		</div>
	);
}

export default App;
