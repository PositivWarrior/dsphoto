import express from 'express';
import {
	createBooking,
	getBookings,
	updateBookingStatus,
	deleteBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// POST: Create a new booking request
router.post('/', createBooking);

// GET: Fetch all booking requests (Admin view)
router.get('/', protect, getBookings);

// PATCH: Update booking status (accept/decline)
router.patch('/:id', protect, updateBookingStatus);

// DELETE: Delete a booking
router.delete('/:id', protect, deleteBooking);

export default router;
