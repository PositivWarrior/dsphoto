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
		const images = await Image.find().sort({ order: 1 });

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
			order: imageCount,
		});

		const savedImage = await newImage.save();
		res.json(savedImage);
	} catch (error) {
		res.status(500).json({ message: 'Error uploading image' });
	}
};
// controllers/imageController.js
export const reorderImages = async (req, res) => {
	const { category, images } = req.body;

	console.log(`Received reorder request for category ${category}`);
	console.log('Received images:', images);

	try {
		await Promise.all(
			images.map((imageId, index) => {
				if (imageId) {
					console.log(`Updating image ${imageId} to order ${index}`);
					return Image.findByIdAndUpdate(imageId, { order: index });
				} else {
					console.warn(`Invalid image ID at index ${index}`);
				}
			}),
		);
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
