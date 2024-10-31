import Image from '../models/imageModel.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new S3Client({
	region: process.env.AWS_REGION,
	credentials: {
		accessKeyId: process.env.AWS_ACCESS_KEY_ID,
		secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	},
});

// Get images with optional category filter
export const getImages = async (req, res) => {
	try {
		const category = req.query.category;
		const filter = category ? { category } : {};
		const images = await Image.find(filter).sort({ order: 1 });

		const imageUrls = images.map((image) => ({
			id: image._id,
			url: image.imageUrl,
			category: image.category,
			title: image.title,
			order: image.order,
		}));

		res.status(200).json(imageUrls);
	} catch (error) {
		console.error('Error fetching images from DB:', error);
		res.status(500).json({ message: 'Error fetching images' });
	}
};

// Upload image
export const uploadImage = async (req, res) => {
	const { title, description, category } = req.body;

	if (!title || !description || !category || !req.file) {
		return res.status(400).json({
			message: 'Please provide all required fields including the image',
		});
	}

	try {
		const imageCount = await Image.countDocuments({ category });
		const newImage = new Image({
			title,
			description,
			imageUrl: req.file.location, // Image URL from the uploaded file
			category,
			order: imageCount,
		});

		const savedImage = await newImage.save();
		res.json(savedImage);
	} catch (error) {
		res.status(500).json({ message: 'Error uploading image' });
	}
};

// Reorder images
export const reorderImages = async (req, res) => {
	const { category, images } = req.body;

	try {
		await Promise.all(
			images.map((imageId, index) => {
				if (imageId) {
					return Image.findByIdAndUpdate(imageId, { order: index });
				} else {
					console.warn(`Invalid image ID at index ${index}`);
					return Promise.resolve();
				}
			}),
		);
		res.status(200).json({ message: 'Order updated successfully' });
	} catch (error) {
		console.error('Error updating image order:', error);
		res.status(500).json({ message: 'Error updating order' });
	}
};

// Get distinct categories
export const getCategories = async (req, res) => {
	try {
		const categories = await Image.distinct('category');
		res.status(200).json({ categories });
	} catch (error) {
		console.error('Error fetching categories:', error);
		res.status(500).json({ message: 'Error fetching categories' });
	}
};

export default { getImages, uploadImage, reorderImages, getCategories };
