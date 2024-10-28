import React, { useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm';
import AdminGalleryOrder from '../components/AdminGalleryOrder';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);
	const [view, setView] = useState('bookings');

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	useEffect(() => {
		const fetchBookings = async () => {
			const response = await fetch('http://localhost:8000/api/bookings', {
				headers: {
					Authorization: `Bearer ${localStorage.getItem('token')}`,
				},
			});
			const data = await response.json();
			setBookings(data.bookings);
		};

		fetchBookings();
	}, []);

	const handleAction = async (bookingId, status) => {
		if (status === 'declined') {
			// If status is 'declined', delete the booking
			try {
				await fetch(`http://localhost:8000/api/bookings/${bookingId}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							'token',
						)}`,
					},
				});
				// Remove the booking from the state
				setBookings((prevBookings) =>
					prevBookings.filter((booking) => booking._id !== bookingId),
				);
			} catch (error) {
				console.error('Error deleting booking:', error);
			}
		} else {
			// If status is 'accepted', update the booking status
			try {
				const response = await fetch(
					`http://localhost:8000/api/bookings/${bookingId}`,
					{
						method: 'PATCH',
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								'token',
							)}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ status }),
					},
				);
				const updatedBooking = await response.json();
				// Update the booking in the state
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
									{/* Accept Button */}
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
									{/* Decline Button (also deletes the booking) */}
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
				return <UploadForm />;
			case 'manageGalleries':
				return <AdminGalleryOrder />;
			default:
				return null;
		}
	};

	return (
		<div className="min-h-screen grid grid-cols-1 md:grid-cols-4 mt-20 py-10">
			<aside className="bg-gray-800 text-white py-8 md:min-h-screen">
				<div className="px-6">
					<h2 className="text-3xl font-bold mb-8">Admin Panel</h2>
					<nav className="space-y-4">
						<button
							onClick={() => setView('bookings')}
							className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
						>
							Bookings
						</button>
						<button
							onClick={() => setView('upload')}
							className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
						>
							Upload Images
						</button>
						<button
							onClick={() => setView('manageGalleries')}
							className="block w-full text-left px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
						>
							Manage Galleries
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
						: 'Manage Galleries'}
				</h2>
				{renderContent()}
			</main>
		</div>
	);
};

export default Admin;
