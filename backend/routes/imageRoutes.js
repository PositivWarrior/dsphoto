import express from 'express';
import { getImages, uploadImage } from '../controllers/imageController.js';
import { protect } from '../middleware/authMiddleware.js';
import upload from '../middleware/uploadMiddleware.js';

const router = express.Router();

router.get('/', getImages);
// router.get('/gallery', getImages);
router.post('/', protect, upload.single('image'), uploadImage);

export default router;
