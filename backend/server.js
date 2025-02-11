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
		origin: ['https://dsphoto.vercel.app', 'http://localhost:3000'],
		credentials: true,
	}),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

connectDB();

app.use('/api/images', imageRoutes);
app.use('/api/users', userRoutes);
app.use('/api', bookingRoutes);
app.use('/api/reviews', reviewRoutes);

app.get('/', (req, res) => {
	res.send('DS PHOTO is on!');
});

app.use('/assets', express.static(path.join(__dirname, '/assets')));

const PORT = process.env.PORT || 8000;
const server = http.createServer(app);

server.listen(PORT, () => {
	console.log(`Server running on HTTP port ${PORT}`);
});
