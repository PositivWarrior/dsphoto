import express from 'express';
import {
	getImages,
	reorderImages,
	uploadImage,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getImages);
router.post('/', protect, upload.single('image'), uploadImage);
router.post('/reorder', reorderImages);

export default router;
