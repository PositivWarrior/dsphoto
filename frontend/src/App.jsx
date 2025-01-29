import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import Admin from './pages/Admin';

import './App.css';
import './index.css';

// Lazy load components with prefetch
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const Login = lazy(() => import(/* webpackPrefetch: true */ './pages/Login'));
const ContactPage = lazy(() => import('./pages/Contact'));
const BookTimePage = lazy(() => import('./pages/BookTime'));
const PricesPage = lazy(() => import('./pages/Prices'));
const GalleryPage = lazy(() => import('./pages/Gallery'));
const GalleryCategory = lazy(() => import('./pages/GalleryCategory'));
const AboutPage = lazy(() => import('./pages/About'));
const ReviewsPage = lazy(() => import('./pages/Reviews'));

function App() {
	const location = useLocation();

	useEffect(() => {
		// Scroll to top when navigating
		window.scrollTo(0, 0);

		// Trigger a "soft refresh" (re-fetch data) instead of a full reload
		document.dispatchEvent(new Event('navigation-change'));
	}, [location.pathname]); // Runs when the URL changes

	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					{/* Admin route without Layout */}
					<Route path="/admin" element={<Admin />} />

					{/* All other routes with Layout */}
					<Route element={<Layout />}>
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
					</Route>
				</Routes>
			</Suspense>
		</BrowserRouter>
	);
}

export default App;
