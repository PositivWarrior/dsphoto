import express from 'express';

const router = express.Router();
import {
	createBooking,
	getBookings,
	updateBookingStatus,
	deleteBooking,
} from '../controllers/bookingController.js';

// POST: Create a new booking request
router.post('/bookings', createBooking);

// GET: Fetch all booking requests (Admin view)
router.get('/bookings', getBookings);

// PATCH: Update booking status (accept/decline)
router.patch('/bookings/:id', updateBookingStatus);

// DELETE: Delete a booking
router.delete('/bookings/:id', deleteBooking);

export default router;
