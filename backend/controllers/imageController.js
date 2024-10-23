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

		// const images = await s3
		// 	.listObjectsV2({
		// 		Bucket: process.env.AWS_BUCKET_NAME,
		// 		Prefix: `images/`,
		// 	})
		// 	.promise();

		// const imageUrls = await Promise.all(
		// 	images.Contents.map(async (image) => {
		// 		// Fetch object metadata to retrieve category
		// 		const metadata = await s3
		// 			.headObject({
		// 				Bucket: process.env.AWS_BUCKET_NAME,
		// 				Key: image.Key,
		// 			})
		// 			.promise();

		// 		return {
		// 			url: `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${image.Key}`,
		// 			category: metadata.Metadata.category || 'unknown', // Retrieve category from metadata
		// 		};
		// 	}),
		// );
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

export default { getImages, uploadImage };
