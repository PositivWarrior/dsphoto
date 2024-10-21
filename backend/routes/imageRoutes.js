import express from 'express';
import {
	getImages,
	uploadImage,
	// deleteImage,
} from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getImages);
router.post('/', protect, upload.single('image'), uploadImage);
// router.delete('/:id', protect, deleteImage);

export default router;
