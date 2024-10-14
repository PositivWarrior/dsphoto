const express = require('express');
const router = express.Router();
const Booking = require('../models/Booking');

// POST: Create a new booking request
router.post('/bookings', async (req, res) => {
	try {
		const booking = new Booking(req.body);
		await booking.save();
		res.status(201).json({ success: true, booking });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// GET: Fetch all booking requests (Admin view)
router.get('/bookings', async (req, res) => {
	try {
		const bookings = await Booking.find({});
		res.json({ success: true, bookings });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

// PATCH: Update booking status (accept/decline)
router.patch('/bookings/:id', async (req, res) => {
	try {
		const booking = await Booking.findById(req.params.id);
		if (!booking)
			return res
				.status(404)
				.json({ success: false, message: 'Booking not found' });

		booking.status = req.body.status; // "accepted" or "declined"
		await booking.save();
		res.json({ success: true, booking });
	} catch (error) {
		res.status(500).json({ success: false, error: error.message });
	}
});

module.exports = router;
