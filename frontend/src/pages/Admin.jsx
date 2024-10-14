import React, { useEffect, useState } from 'react';
import UploadForm from '../components/UploadForm';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
	const navigate = useNavigate();
	const [bookings, setBookings] = useState([]);
	const [view, setView] = useState('bookings'); // Control the view

	const handleLogout = () => {
		localStorage.removeItem('token');
		navigate('/login');
	};

	useEffect(() => {
		// Fetch all bookings from the API
		const fetchBookings = async () => {
			const response = await fetch('/api/bookings');
			const data = await response.json();
			setBookings(data.bookings);
		};

		fetchBookings();
	}, []);

	const handleAction = async (bookingId, status) => {
		try {
			const response = await fetch(`/api/bookings/${bookingId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status }),
			});
			const updatedBooking = await response.json();

			// Update the bookings list
			setBookings((prevBookings) =>
				prevBookings.map((booking) =>
					booking._id === updatedBooking.booking._id
						? updatedBooking.booking
						: booking,
				),
			);
		} catch (error) {
			console.error('Error updating booking:', error);
		}
	};

	// Rendering the content based on the selected view
	const renderContent = () => {
		if (view === 'bookings') {
			return (
				<ul>
					{bookings.map((booking) => (
						<li
							key={booking._id}
							className="mb-4 p-4 bg-white shadow-lg rounded-lg"
						>
							<p>
								<strong>{booking.name}</strong> ({booking.email}
								) - {booking.date}
							</p>
							<p>{booking.message}</p>
							<p>Status: {booking.status}</p>
							<div className="mt-4">
								<button
									className="mr-4 bg-green-500 text-white px-4 py-2 rounded"
									onClick={() =>
										handleAction(booking._id, 'accepted')
									}
								>
									Accept
								</button>
								<button
									className="bg-red-500 text-white px-4 py-2 rounded"
									onClick={() =>
										handleAction(booking._id, 'declined')
									}
								>
									Decline
								</button>
							</div>
						</li>
					))}
				</ul>
			);
		} else if (view === 'upload') {
			return <UploadForm />;
		}
	};

	return (
		<div className="min-h-screen grid grid-cols-1 md:grid-cols-4 mt-10">
			{/* Sidebar */}
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
							onClick={handleLogout}
							className="block w-full text-left px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg"
						>
							Logout
						</button>
					</nav>
				</div>
			</aside>

			{/* Main Content */}
			<main className="col-span-3 p-8 bg-gray-100">
				<h2 className="text-4xl font-bold mb-6">
					{view === 'bookings' ? 'Bookings' : 'Upload Images'}
				</h2>
				{renderContent()}
			</main>
		</div>
	);
};

export default Admin;
