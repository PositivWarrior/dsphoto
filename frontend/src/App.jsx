import React, { Suspense, lazy, useEffect } from 'react';
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
	useNavigate,
} from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';
import Layout from './components/Layout';
import Admin from './pages/Admin';

import './App.css';
import './index.css';

// Lazy load components with prefetch
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ContactPage = lazy(() => import('./pages/Contact'));
const BookTimePage = lazy(() => import('./pages/BookTime'));
const PricesPage = lazy(() => import('./pages/Prices'));
const GalleryPage = lazy(() => import('./pages/Gallery'));
const GalleryCategory = lazy(() => import('./pages/GalleryCategory'));
const AboutPage = lazy(() => import('./pages/About'));
const ReviewsPage = lazy(() => import('./pages/Reviews'));

// ✅ FIXED: Move `ScrollToTop` inside the Router
function ScrollToTop() {
	const location = useLocation();
	useEffect(() => {
		window.scrollTo(0, 0);
	}, [location.pathname]);
	return null;
}

// ✅ FIXED: Handle browser back button
function BackButtonFix() {
	const navigate = useNavigate();
	useEffect(() => {
		const handlePopState = () => {
			navigate(0); // Force refresh on back navigation
		};
		window.addEventListener('popstate', handlePopState);
		return () => window.removeEventListener('popstate', handlePopState);
	}, [navigate]);
	return null;
}

function App() {
	return (
		<Router>
			<ScrollToTop />
			<BackButtonFix />
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
		</Router>
	);
}

export default App;
