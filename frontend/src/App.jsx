import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import Admin from './pages/Admin';
import ProtectedRoute from './components/ProtectedRoute';

import './App.css';
import './index.css';

// Lazy load components
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const ContactPage = lazy(() => import('./pages/Contact'));
const BookTimePage = lazy(() => import('./pages/BookTime'));
const PricesPage = lazy(() => import('./pages/Prices'));
const GalleryPage = lazy(() => import('./pages/Gallery'));
const GalleryCategory = lazy(() => import('./pages/GalleryCategory'));
const AboutPage = lazy(() => import('./pages/About'));
const ReviewsPage = lazy(() => import('./pages/Reviews'));

function App() {
	return (
		<BrowserRouter>
			<Suspense fallback={<LoadingSpinner />}>
				<Routes>
					<Route element={<Layout />}>
						<Route path="/" element={<Home />} />
						<Route path="/login" element={<Login />} />
						<Route
							path="/admin"
							element={
								<ProtectedRoute>
									<Admin />
								</ProtectedRoute>
							}
						/>
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
