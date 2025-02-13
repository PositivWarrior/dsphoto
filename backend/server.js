import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import { fileURLToPath } from 'url';
import compression from 'compression';

import connectDB from './config/db.js';

// Import routes
import imageRoutes from './routes/imageRoutes.js';
import userRoutes from './routes/userRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();

app.use(compression());

app.use(
	cors({
		origin: [
			'https://dsphoto.vercel.app',
			'http://localhost:3000',
			'https://fotods.no',
			'https://www.fotods.no',
		],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

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
	console.error('Server Error:', err.stack);
	res.status(500).json({
		message: 'Internal Server Error',
		error: process.env.NODE_ENV === 'development' ? err.message : undefined,
	});
});

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server running on HTTP port ${PORT}`);
});
