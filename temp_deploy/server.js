import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import compression from 'compression';
import connectDB from './config/db.js';
import mongoose from 'mongoose';

// Import routes
import imageRoutes from './routes/imageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

// Connect to MongoDB first
await connectDB();

// CORS configuration
const corsOptions = {
	origin: ['https://fotods.no', 'http://localhost:5173'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: [
		'Origin',
		'X-Requested-With',
		'Content-Type',
		'Accept',
		'Authorization',
	],
	credentials: true,
	optionsSuccessStatus: 204,
	exposedHeaders: ['ETag'],
	maxAge: 86400,
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Middleware
app.use(express.json());
app.use(compression());
app.use(bodyParser.json());

// Routes
app.use('/images', imageRoutes);
app.use('/users', userRoutes);
app.use('/bookings', bookingRoutes);
app.use('/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.json({ message: 'DS PHOTO API is running' });
});

// Add this after your other routes
app.get('/debug', (req, res) => {
	res.json({
		message: 'Debug endpoint working',
		time: new Date().toISOString(),
		mongodb:
			mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
	});
});

app.use('/assets', express.static(path.join(__dirname, '/assets')));

// Add MongoDB connection handling
mongoose.connection.on('disconnected', () => {
	console.log('MongoDB disconnected! Attempting to reconnect...');
	setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
});

mongoose.connection.on('error', (err) => {
	console.error('MongoDB connection error:', err);
	setTimeout(connectDB, 5000); // Try to reconnect after 5 seconds
});

// Error handling middleware
app.use((err, req, res, next) => {
	console.error('Server Error:', {
		message: err.message,
		stack: err.stack,
		mongoState: mongoose.connection.readyState,
	});
	res.status(500).json({
		message: 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

// Update the error handling at the bottom
process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection:', err);
	// Don't exit the process, just log the error
	console.error('Process will continue running...');
});

process.on('uncaughtException', (err) => {
	console.error('Uncaught Exception:', err);
	// Don't exit the process, just log the error
	console.error('Process will continue running...');
});
