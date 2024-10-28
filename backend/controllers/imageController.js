import Image from '../models/imageModel.js';
import aws from 'aws-sdk';
import dotenv from 'dotenv';

dotenv.config();

const s3 = new aws.S3({
	accessKeyId: process.env.AWS_ACCESS_KEY_ID,
	secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
	region: process.env.AWS_REGION,
});

export const getImages = async (req, res) => {
	try {
		const images = await Image.find().sort({ order: 1 }); // Ensure images are ordered by `order`

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

export const uploadImage = async (req, res) => {
	const { title, description, category } = req.body;

	if (!title || !description || !category || !req.file) {
		return res.status(400).json({
			message: 'Please provide all required fields including the image',
		});
	}

	try {
		// Count images in the category to assign the order for the new image
		const imageCount = await Image.countDocuments({ category });

		const newImage = new Image({
			title,
			description,
			imageUrl,
			category,
			order: imageCount, // Set order as the last position in the category
		});

		const savedImage = await newImage.save();
		res.json(savedImage);
	} catch (error) {
		res.status(500).json({ message: 'Error uploading image' });
	}
};
// controllers/imageController.js
export const reorderImages = async (req, res) => {
	const { category, images } = req.body; // `images` is an array of image IDs in the new order

	try {
		// Loop through the image IDs and set their `order` field based on the new order
		for (let i = 0; i < images.length; i++) {
			await Image.findByIdAndUpdate(images[i], { order: i });
		}
		res.status(200).json({ message: 'Order updated successfully' });
	} catch (error) {
		console.error('Error updating image order:', error);
		res.status(500).json({ message: 'Error updating order' });
	}
};

export const getCategories = async (req, res) => {
	try {
		// Use MongoDB's distinct method to find unique category values
		const categories = await Image.distinct('category');
		res.status(200).json({ categories });
	} catch (error) {
		console.error('Error fetching categories:', error);
		res.status(500).json({ message: 'Error fetching categories' });
	}
};

export default { getImages, uploadImage, reorderImages, getCategories };
