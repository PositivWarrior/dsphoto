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
const Home = lazy(() =>
	import('./pages/Home').then((module) => ({ default: module.default })),
);
const Login = lazy(() =>
	import('./pages/Login').then((module) => ({ default: module.default })),
);
const ContactPage = lazy(() =>
	import('./pages/Contact').then((module) => ({ default: module.default })),
);
const BookTimePage = lazy(() =>
	import('./pages/BookTime').then((module) => ({ default: module.default })),
);
const PricesPage = lazy(() =>
	import('./pages/Prices').then((module) => ({ default: module.default })),
);
const GalleryPage = lazy(() =>
	import('./pages/Gallery').then((module) => ({ default: module.default })),
);
const GalleryCategory = lazy(() =>
	import('./pages/GalleryCategory').then((module) => ({
		default: module.default,
	})),
);
const AboutPage = lazy(() =>
	import('./pages/About').then((module) => ({ default: module.default })),
);
const ReviewsPage = lazy(() =>
	import('./pages/Reviews').then((module) => ({ default: module.default })),
);

function ScrollToTop() {
	const location = useLocation();
	const navigate = useNavigate();

	useEffect(() => {
		window.scrollTo(0, 0);
		document.dispatchEvent(new Event('navigation-change'));
	}, [location.pathname]);

	return null;
}

// Detect browser back button
useEffect(() => {
	const handlePopState = () => {
		navigate(0); // Force refresh on back navigation
	};
	window.addEventListener('popstate', handlePopState);
	return () => window.removeEventListener('popstate', handlePopState);
}, [navigate]);

function App() {
	return (
		<BrowserRouter>
			<ScrollToTop />
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					<Route path="/admin" element={<Admin />} />
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
