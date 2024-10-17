import Booking from '../models/bookingModel.js';

// Create a new booking
export const createBooking = async (req, res) => {
	console.log('Received booking request:', req.body);

	try {
		const booking = new Booking(req.body);

		console.log('Booking object:', booking);

		await booking.save();
		res.status(201).json({ success: true, booking });
	} catch (error) {
		console.error('Error creating booking:', error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Get all bookings (for admin)
export const getBookings = async (req, res) => {
	try {
		const bookings = await Booking.find({});
		res.json({ success: true, bookings });
	} catch (error) {
		console.error('Error fetching bookings:', error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Update booking status (accept or decline)
export const updateBookingStatus = async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res
				.status(404)
				.json({ success: false, message: 'Booking not found' });
		}

		booking.status = req.body.status; // "accepted" or "declined"
		await booking.save();
		res.json({ success: true, booking });
	} catch (error) {
		console.error('Error updating booking status:', error);
		res.status(500).json({ success: false, message: error.message });
	}
};
