import express from 'express';
import {
	getImages,
	reorderImages,
	uploadImage,
	getCategories,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getImages);
router.get('/categories', getCategories);
router.post('/', protect, upload.single('image'), uploadImage);
router.post('/reorder', protect, reorderImages);

export default router;
