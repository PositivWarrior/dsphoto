import Booking from '../models/bookingModel.js';
import emailjs from 'emailjs-com';

// Create a new booking
export const createBooking = async (req, res) => {
	try {
		const booking = new Booking(req.body);
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

		booking.status = req.body.status;
		await booking.save();

		if (req.body.status === 'accepted') {
			await emailjs.send('service_y1tvzoi', 'template_id_accept', {
				to_name: booking.name,
				to_email: booking.email,
				message: 'Your booking has been accepted!',
				reply_to: 'info@fotods.no',
			});
		} else if (req.body.status === 'declined') {
			await emailjs.send('service_y1tvzoi', 'template_id_decline', {
				to_name: booking.name,
				to_email: booking.email,
				message:
					'Sorry, the requested date is unavailable. Please try another date or contact me.',
				reply_to: 'info@fotods.no',
			});
		}

		res.json({ success: true, booking });
	} catch (error) {
		console.error('Error updating booking status:', error);
		res.status(500).json({ success: false, message: error.message });
	}
};

// Delete a booking
export const deleteBooking = async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking) {
			return res
				.status(404)
				.json({ success: false, message: 'Booking not found' });
		}

		await Booking.findByIdAndDelete(req.params.id);
		res.json({ success: true, message: 'Booking deleted' });
	} catch (error) {
		console.error('Error deleting booking:', error);
		res.status(500).json({ success: false, message: error.message });
	}
};
