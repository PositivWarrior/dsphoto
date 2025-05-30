#!/bin/bash

# Create the ES modules version of imageOptimizer.js
cat > imageOptimizer.js << 'EOF'
import axios from 'axios';
import sharp from 'sharp';
import { S3 } from 'aws-sdk';
const s3 = new S3();

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
EOF

# Create the fixed imageRoutes.js file
cat > imageRoutes.js << 'EOF'
import express from 'express';
import {
        getImages,
        reorderImages,
        uploadImage,
        getCategories,
        deleteImage,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';
import { optimizeImage } from '../controllers/imageOptimizer.js';

const router = express.Router();

router.get('/', getImages);
router.get('/categories', getCategories);
router.post('/', protect, upload.single('image'), uploadImage);
router.post('/reorder', protect, reorderImages);
router.delete('/:id', protect, deleteImage);

// Image optimization route - public
router.get('/image-proxy', optimizeImage);

// Public routes
router.get('/featured', getImages);
router.get('/category/:category', getImages);
router.get('/:id', getImages);

// Protected routes
router.put('/:id', protect, uploadImage);

export default router;
EOF

# Move the files to the correct location
sudo mv imageOptimizer.js /var/www/dsphoto-backend/controllers/
sudo mv imageRoutes.js /var/www/dsphoto-backend/routes/

# Set the correct permissions
sudo chown ubuntu:ubuntu /var/www/dsphoto-backend/controllers/imageOptimizer.js
sudo chown ubuntu:ubuntu /var/www/dsphoto-backend/routes/imageRoutes.js

# Restart the backend service
pm2 restart dsphoto-backend && pm2 save

echo "Backend files fixed and service restarted!" 