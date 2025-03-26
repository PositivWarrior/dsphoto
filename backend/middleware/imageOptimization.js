import sharp from 'sharp';
import axios from 'axios';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const writeFileAsync = promisify(fs.writeFile);
const mkdirAsync = promisify(fs.mkdir);
const existsAsync = promisify(fs.exists);

// Cache directory
const CACHE_DIR = path.join(__dirname, '../cache/images');

// Ensure cache directory exists
async function ensureCacheDir() {
	if (!(await existsAsync(CACHE_DIR))) {
		await mkdirAsync(CACHE_DIR, { recursive: true });
	}
}

/**
 * Middleware to optimize images
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next function
 */
async function optimizeImage(req, res, next) {
	try {
		// Only process if the request is for image optimization
		const { url } = req.query;
		if (!url) return next();

		// Get optimization parameters
		const width = parseInt(req.query.width) || 800;
		const format = req.query.format || 'webp';
		const quality = parseInt(req.query.quality) || 80;

		// Generate cache key based on url and parameters
		const cacheKey = `${encodeURIComponent(
			url,
		)}_w${width}_${format}_q${quality}`;
		const cachePath = path.join(CACHE_DIR, `${cacheKey}`);

		// Check if image exists in cache
		await ensureCacheDir();
		if (await existsAsync(cachePath)) {
			// Serve cached image
			res.setHeader('Content-Type', `image/${format}`);
			res.setHeader('Cache-Control', 'public, max-age=31536000');
			return res.sendFile(cachePath);
		}

		// Fetch the original image
		const response = await axios.get(url, {
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0 (compatible; ImageOptimizer/1.0)',
			},
		});

		let image = sharp(response.data);

		// Resize if width is specified
		if (width) {
			image = image.resize({ width, withoutEnlargement: true });
		}

		// Convert to the requested format
		switch (format) {
			case 'webp':
				image = image.webp({ quality });
				break;
			case 'jpeg':
			case 'jpg':
				image = image.jpeg({ quality });
				break;
			case 'png':
				image = image.png({ quality });
				break;
			case 'avif':
				image = image.avif({ quality });
				break;
			default:
				image = image.webp({ quality });
		}

		// Process the image
		const optimizedImageBuffer = await image.toBuffer();

		// Save to cache
		await writeFileAsync(cachePath, optimizedImageBuffer);

		// Send the optimized image
		res.setHeader('Content-Type', `image/${format}`);
		res.setHeader('Cache-Control', 'public, max-age=31536000');
		res.end(optimizedImageBuffer);
	} catch (error) {
		console.error('Image optimization error:', error);
		next(error);
	}
}

export default { optimizeImage };
