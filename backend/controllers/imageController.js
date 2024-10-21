import Image from '../models/imageModel.js';

export const getImages = async (req, res) => {
	try {
		const images = await Image.find({});
		res.json(images);
	} catch (error) {
		res.status(500).json({ message: 'No images' });
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
