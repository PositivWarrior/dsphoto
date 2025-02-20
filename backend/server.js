import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
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

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(compression());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Ignore ACME challenge requests (let Nginx handle them)
app.use('/.well-known/acme-challenge', (req, res, next) => {
	res.status(404).send('Not found');
});

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
		environment: process.env.NODE_ENV,
		headers: req.headers,
		remoteAddress: req.ip,
		hostname: req.hostname,
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

server.listen(PORT, '127.0.0.1', () => {
	console.log(`Server running on localhost:${PORT}`);
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
