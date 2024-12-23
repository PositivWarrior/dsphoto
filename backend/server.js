import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import http from 'http';
import https from 'https';
import fs from 'fs';
import { fileURLToPath } from 'url';

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

app.use(cors());
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

// Check if SSL key and cert are available for HTTPS
const useHttps =
	process.env.NODE_ENV === 'production' ||
	(fs.existsSync(process.env.SSL_KEY_PATH) &&
		fs.existsSync(process.env.SSL_CERT_PATH));
const server = useHttps
	? https.createServer(
			{
				key: fs.readFileSync(process.env.SSL_KEY_PATH),
				cert: fs.readFileSync(process.env.SSL_CERT_PATH),
			},
			app,
	  )
	: http.createServer(app);

const PORT = process.env.PORT || 8000;
server.listen(PORT, () =>
	console.log(
		`Server running on ${useHttps ? 'HTTPS' : 'HTTP'} on port ${PORT}`,
	),
);
