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
		const categories = [
			'weddings',
			'portraits',
			'animals',
			'art',
			'pregnant',
			'newborn',
			'housing',
			'nature',
			'landscape',
		];
		let galleryData = [];

		// Fetch images for each category
		for (let category of categories) {
			const images = await s3
				.listObjectsV2({
					Bucket: process.env.AWS_BUCKET_NAME,
					Prefix: `images/${category}/`, // Path to the category folder in S3
				})
				.promise();

			const imageUrls = images.Contents.map((image) => ({
				url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${image.Key}`,
			}));

			galleryData.push({
				id: category,
				title: category.charAt(0).toUpperCase() + category.slice(1),
				images: imageUrls,
			});
		}

		res.status(200).json(galleryData);
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

export default { getImages, uploadImage };
