const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true },
	date: { type: String, required: true },
	message: { type: String },
	status: { type: String, default: 'pending' },
});

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;
