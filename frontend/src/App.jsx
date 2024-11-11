import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import Login from './pages/Login';
import Admin from './pages/Admin';
import ContactPage from './pages/Contact';
import BookTimePage from './pages/BookTime';
import PricesPage from './pages/Prices';
import GalleryPage from './pages/Gallery';
import GalleryCategory from './pages/GalleryCategory';
import AboutPage from './pages/About';
import ReviewsPage from './pages/Reviews';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import './index.css';
function App() {
	return (
		<Router>
			<Navbar />
			<Routes>
				<Route path="/" element={<Home />} />
				<Route path="/login" element={<Login />} />
				<Route path="/about" element={<AboutPage />} />
				<Route path="/contact" element={<ContactPage />} />
				<Route path="/book" element={<BookTimePage />} />
				<Route path="/prices" element={<PricesPage />} />
				<Route path="/reviews" element={<ReviewsPage />} />
				<Route path="/gallery" element={<GalleryPage />} />
				<Route
					path="/gallery/:category"
					element={<GalleryCategory />}
				/>
				<Route
					path="/admin"
					element={
						<ProtectedRoute>
							<Admin />
						</ProtectedRoute>
					}
				/>
			</Routes>
		</Router>
	);
}

export default App;
