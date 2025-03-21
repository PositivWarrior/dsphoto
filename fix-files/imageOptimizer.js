import axios from 'axios';
import sharp from 'sharp';
import AWS from 'aws-sdk';
const s3 = new AWS.S3();

/**
 * Image optimization controller
 * This function fetches an image from a URL, optimizes it using Sharp,
 * and returns the optimized image.
 */
export const optimizeImage = async (req, res) => {
	try {
		const { url, width, format, quality } = req.query;

		if (!url) {
			return res.status(400).json({ message: 'URL is required' });
		}

		// Default values
		const imageWidth = width ? parseInt(width, 10) : 800;
		const imageFormat = format || 'webp';
		const imageQuality = quality ? parseInt(quality, 10) : 80;

		// Check if URL is from our S3 bucket
		const isS3Url = url.includes('ds-photo.s3.eu-north-1.amazonaws.com');
		let imageBuffer;

		if (isS3Url) {
			// Parse the S3 URL to get bucket and key
			const s3Url = new URL(url);
			const pathParts = s3Url.pathname.split('/');
			const bucketName = s3Url.hostname.split('.')[0];
			// Remove the first empty element from the path
			pathParts.shift();
			const key = pathParts.join('/');

			// Get the image directly from S3
			const s3Response = await s3
				.getObject({
					Bucket: bucketName,
					Key: key,
				})
				.promise();

			imageBuffer = s3Response.Body;
		} else {
			// Fetch image from URL
			const response = await axios.get(url, {
				responseType: 'arraybuffer',
			});
			imageBuffer = Buffer.from(response.data);
		}

		// Process the image using Sharp
		let sharpInstance = sharp(imageBuffer);

		// Resize if width is specified
		if (imageWidth) {
			sharpInstance = sharpInstance.resize({
				width: imageWidth,
				withoutEnlargement: true,
			});
		}

		// Set format
		if (imageFormat === 'webp') {
			sharpInstance = sharpInstance.webp({ quality: imageQuality });
		} else if (imageFormat === 'avif') {
			sharpInstance = sharpInstance.avif({ quality: imageQuality });
		} else if (imageFormat === 'jpeg' || imageFormat === 'jpg') {
			sharpInstance = sharpInstance.jpeg({ quality: imageQuality });
		} else if (imageFormat === 'png') {
			sharpInstance = sharpInstance.png({ quality: imageQuality });
		}

		// Get the optimized image buffer
		const optimizedBuffer = await sharpInstance.toBuffer();

		// Set appropriate content type
		const contentTypes = {
			webp: 'image/webp',
			avif: 'image/avif',
			jpeg: 'image/jpeg',
			jpg: 'image/jpeg',
			png: 'image/png',
		};

		// Set cache headers (cache for 30 days)
		res.setHeader('Cache-Control', 'public, max-age=2592000');
		res.setHeader(
			'Content-Type',
			contentTypes[imageFormat] || 'image/webp',
		);

		// Send the optimized image
		return res.send(optimizedBuffer);
	} catch (error) {
		console.error('Image optimization error:', error);
		return res.status(500).json({ message: 'Failed to optimize image' });
	}
};
