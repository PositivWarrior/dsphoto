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
import imageOptimizer from '../controllers/imageOptimizer.js';

const router = express.Router();

router.get('/', getImages);
router.get('/categories', getCategories);
router.post('/', protect, upload.single('image'), uploadImage);
router.post('/reorder', protect, reorderImages);
router.delete('/:id', protect, deleteImage);

// Image optimization route - public
router.get('/image-proxy', imageOptimizer.optimizeImage);

// Public routes
router.get('/featured', getImages);
router.get('/category/:category', getImages);
router.get('/:id', getImages);

// Protected routes
router.put('/:id', protect, uploadImage);

export default router;
