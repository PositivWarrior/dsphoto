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
		const images = await Image.find();

		const imageUrls = images.map((image) => ({
			url: image.imageUrl,
			category: image.category,
			title: image.title,
		}));

		res.status(200).json(imageUrls);
	} catch (error) {
		console.error('Error fetching images from S3:', error);
		res.status(500).json({ message: 'Error fetching images from S3' });
	}
};

export const uploadImage = async (req, res) => {
	const { title, description, category } = req.body;

	if (!title || !description || !category || !req.file) {
		return res.status(400).json({
			message: 'Please provide all required fields including the image',
		});
	}

	const imageUrl = req.file.location;

	try {
		const newImage = new Image({
			title,
			description,
			imageUrl,
			category,
		});

		const savedImage = await newImage.save();
		res.json(savedImage);
	} catch (error) {
		res.status(500).json({ message: 'Error uploading image' });
	}
};

// controllers/imageController.js
export const reorderImages = async (req, res) => {
	const { category, order } = req.body; // `order` is an array of image IDs

	try {
		// Update each image with a new order based on its position in the array
		for (let i = 0; i < order.length; i++) {
			await Image.findByIdAndUpdate(order[i], { order: i });
		}
		res.status(200).json({ message: 'Order updated successfully' });
	} catch (error) {
		console.error('Error updating order:', error);
		res.status(500).json({ message: 'Error updating order' });
	}
};

export default { getImages, uploadImage, reorderImages };
