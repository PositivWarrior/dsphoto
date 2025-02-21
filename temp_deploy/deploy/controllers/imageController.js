import Image from '../models/imageModel.js';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

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
		// Log MongoDB connection state
		console.log(
			'MongoDB connection state:',
			mongoose.connection.readyState,
		);

		const category = req.query.category;
		console.log('Requested category:', category);

		const filter = category ? { category } : {};
		console.log('Filter:', filter);

		// Try to execute the query
		console.log('Executing Image.find()...');
		const images = await Image.find(filter).sort({ order: 1 });
		console.log('Found images count:', images.length);

		const imageUrls = images.map((image) => ({
			id: image._id,
			url: image.imageUrl,
			category: image.category,
			title: image.title,
			order: image.order,
		}));

		console.log('Successfully processed images');
		res.status(200).json(imageUrls);
	} catch (error) {
		console.error('Detailed error in getImages:', {
			name: error.name,
			message: error.message,
			stack: error.stack,
			mongoState: mongoose.connection.readyState,
		});
		res.status(500).json({
			message: 'Error fetching images',
			error: error.message,
			mongoState: mongoose.connection.readyState,
		});
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

export const deleteImage = async (req, res) => {
	const { id } = req.params;

	try {
		const image = await Image.findById(id);
		if (!image) {
			return res.status(404).json({ message: 'Image not found' });
		}

		// Delete the file from S3
		await s3.send(
			new DeleteObjectCommand({
				Bucket: process.env.AWS_BUCKET_NAME,
				Key: image.imageUrl.split('/').pop(), // Extract the filename from the URL
			}),
		);

		// Delete the image record from the database
		await Image.findByIdAndDelete(id);
		res.status(200).json({ message: 'Image deleted successfully' });
	} catch (error) {
		console.error('Error deleting image:', error);
		res.status(500).json({ message: 'Error deleting image' });
	}
};

export default {
	getImages,
	uploadImage,
	reorderImages,
	getCategories,
	deleteImage,
};
