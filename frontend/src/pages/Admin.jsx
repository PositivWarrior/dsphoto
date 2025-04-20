import React, { useEffect, useState, lazy, Suspense } from 'react';
// import UploadForm from '../components/UploadForm'; // Lazy load if needed
// import AdminGalleryOrder from '../components/AdminGalleryOrder'; // Lazy load this
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { jwtDecode } from 'jwt-decode';
import { Helmet } from 'react-helmet-async';
// import ImageList from '../components/ImageList'; // Lazy load if needed
import { API } from '../api';

// Lazy load admin components
const LazyUploadForm = lazy(() => import('../components/UploadForm'));
const LazyAdminGalleryOrder = lazy(() =>
	import('../components/AdminGalleryOrder'),
);
const LazyImageList = lazy(() => import('../components/ImageList'));

const Admin = () => {
	const [bookings, setBookings] = useState([]);
	const [view, setView] = useState(
		localStorage.getItem('adminView') || 'bookings',
	); // Initialize with stored view
	const [isLoading, setIsLoading] = useState(true);
	const [adminName, setAdminName] = useState('');
	const navigate = useNavigate();

	const handleLogout = () => {
		localStorage.removeItem('token');
		localStorage.removeItem('userInfo');
		navigate('/login');
	};

	useEffect(() => {
		const userInfo = localStorage.getItem('userInfo');
		if (userInfo) {
			const { name } = JSON.parse(userInfo);
			setAdminName(name);
		} else {
			const token = localStorage.getItem('token');
			if (token) {
				try {
					const decoded = jwtDecode(token);
					setAdminName(decoded.name);
				} catch (error) {
					console.error('Error decoding token:', error);
					navigate('/login');
				}
			} else {
				navigate('/login');
			}
		}
	}, [navigate]);

	useEffect(() => {
		const fetchBookings = async () => {
			try {
				setIsLoading(true);
				const response = await API.get('/bookings');
				setBookings(response.data.bookings);
			} catch (error) {
				console.error('Error fetching bookings:', error);
			} finally {
				setIsLoading(false);
			}
		};

		fetchBookings();
	}, []);

	// Update the view and store it in localStorage
	const changeView = (newView) => {
		setView(newView);
		localStorage.setItem('adminView', newView);
	};

	const handleAction = async (bookingId, status) => {
		if (status === 'declined') {
			try {
				await API.delete(`/bookings/${bookingId}`);
				setBookings((prevBookings) =>
					prevBookings.filter((booking) => booking._id !== bookingId),
				);
			} catch (error) {
				console.error('Error deleting booking:', error);
			}
		} else {
			try {
				const response = await API.patch(`/bookings/${bookingId}`, {
					status,
				});
				const updatedBooking = response.data;
				setBookings((prevBookings) =>
					prevBookings.map((booking) =>
						booking._id === updatedBooking._id
							? updatedBooking
							: booking,
					),
				);
			} catch (error) {
				console.error('Error updating booking status:', error);
			}
		}
	};

	// Rendering the content based on the selected view
	const renderContent = () => {
		switch (view) {
			case 'bookings':
				return (
					<ul>
						{bookings.map((booking) => (
							<li
								key={booking._id}
								className="mb-4 p-4 bg-white shadow-lg rounded-lg py-10 mt-10"
							>
								<p>
									<strong>Name:</strong> {booking.name}
								</p>
								<p>
									<strong>Email:</strong> {booking.email}
								</p>
								<p>
									<strong>Date:</strong> {booking.date}
								</p>
								<p>
									<strong>Message:</strong> {booking.message}
								</p>
								<p>
									<strong>Status:</strong> {booking.status}
								</p>
								<div className="mt-4">
									<button
										className="mr-4 bg-green-500 text-white px-4 py-2 rounded"
										onClick={() =>
											handleAction(
												booking._id,
												'accepted',
											)
										}
									>
										Accept
									</button>
									<button
										className="bg-red-500 text-white px-4 py-2 rounded"
										onClick={() =>
											handleAction(
												booking._id,
												'declined',
											)
										}
									>
										Decline
									</button>
								</div>
							</li>
						))}
					</ul>
				);
			case 'upload':
				return (
					<Suspense fallback={<LoadingSpinner />}>
						<LazyUploadForm />
					</Suspense>
				);
			case 'manageGalleries':
				return (
					<Suspense fallback={<LoadingSpinner />}>
						<LazyAdminGalleryOrder />
					</Suspense>
				);
			case 'imageList':
				return (
					<Suspense fallback={<LoadingSpinner />}>
						<LazyImageList />
					</Suspense>
				);
			default:
				return null;
		}
	};

	// Add loading check before the main render
	if (isLoading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="container mx-auto px-4 py-8 mt-20">
			<Helmet>
				<title>Admin Panel | FotoDS</title>
			</Helmet>

			<div className="space-y-8">
				<div className="min-h-screen grid grid-cols-1 md:grid-cols-4">
					<aside className="bg-gray-800 text-white py-8 md:min-h-screen">
						<div className="px-6">
							<h2 className="text-3xl font-bold mb-2">
								Admin Panel
							</h2>
							<p className="text-gray-400 mb-8">
								Welcome {adminName}
							</p>
							<nav className="space-y-4">
								<button
									onClick={() => changeView('bookings')}
									className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
								>
									Bookings
								</button>
								<button
									onClick={() => changeView('upload')}
									className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
								>
									Upload Images
								</button>
								<button
									onClick={() =>
										changeView('manageGalleries')
									}
									className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
								>
									Manage Galleries
								</button>
								<button
									onClick={() => changeView('imageList')}
									className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
								>
									Image List
								</button>
								<button
									onClick={handleLogout}
									className="block w-full text-left px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
								>
									Logout
								</button>
							</nav>
						</div>
					</aside>

					<main className="col-span-3 p-8 bg-gray-100">
						<h2 className="text-4xl font-bold mb-6">
							{view === 'bookings'
								? 'Bookings'
								: view === 'upload'
								? 'Upload Images'
								: view === 'manageGalleries'
								? 'Manage Galleries'
								: 'Image List'}
						</h2>
						{renderContent()}
					</main>
				</div>
			</div>
		</div>
	);
};

export default Admin;
