import mongoose from 'mongoose';

const connectDB = async () => {
	try {
		const conn = await mongoose.connect(process.env.MONGO_URI, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
			serverSelectionTimeoutMS: 5000,
		});
		console.log(`MongoDB Connected: ${conn.connection.host}`);

		// Add connection error handler
		mongoose.connection.on('error', (err) => {
			console.error('MongoDB connection error:', err);
		});

		// Add disconnection handler
		mongoose.connection.on('disconnected', () => {
			console.log('MongoDB disconnected');
		});
	} catch (error) {
		console.error('MongoDB connection error:', error);
		process.exit(1);
	}
};

export default connectDB;
