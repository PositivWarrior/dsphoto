import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		email: {
			type: String,
			required: true,
		},
		date: {
			type: String, // You can refine this to use a Date type
			required: true,
		},
		message: {
			type: String,
		},
		status: {
			type: String,
			enum: ['pending', 'accepted', 'declined'],
			default: 'pending',
		},
	},
	{ timestamps: true },
);

const Booking = mongoose.model('Booking', bookingSchema);

export default Booking;
