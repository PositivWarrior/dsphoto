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
	origin: ['https://fotods.no', 'https://www.fotods.no'],
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization'],
	credentials: true,
	optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests
app.options('*', cors(corsOptions));

// Force HTTPS
app.use((req, res, next) => {
	if (req.secure || req.headers['x-forwarded-proto'] === 'https') {
		next();
	} else {
		res.redirect(301, `https://${req.headers.host}${req.url}`);
	}
});

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

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
	console.error('Unhandled Rejection:', err);
	server.close(() => process.exit(1));
});
