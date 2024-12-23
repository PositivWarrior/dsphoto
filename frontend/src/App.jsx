import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

import './App.css';
import './index.css';

// Lazy load components with prefetch
const Home = lazy(() => import(/* webpackPrefetch: true */ './pages/Home'));
const Login = lazy(() => import(/* webpackPrefetch: true */ './pages/Login'));
const Admin = lazy(() => import('./pages/Admin'));
const ContactPage = lazy(() => import('./pages/Contact'));
const BookTimePage = lazy(() => import('./pages/BookTime'));
const PricesPage = lazy(() => import('./pages/Prices'));
const GalleryPage = lazy(() => import('./pages/Gallery'));
const GalleryCategory = lazy(() => import('./pages/GalleryCategory'));
const AboutPage = lazy(() => import('./pages/About'));
const ReviewsPage = lazy(() => import('./pages/Reviews'));

function App() {
	return (
		<Router>
			<Navbar />
			<Suspense fallback={<LoadingSpinner />}>
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
			</Suspense>
		</Router>
	);
}

export default App;
