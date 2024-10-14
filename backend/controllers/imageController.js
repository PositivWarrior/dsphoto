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
			message:
				'Please provide all required fields: title, description, category, and image.',
		});
	}

	const imageUrl = `/uploads/${req.file.filename}`;

	try {
		const image = new Image({
			title,
			description,
			imageUrl,
			category,
		});

		const savedImage = await image.save();
		res.status(201).json(savedImage);
	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Image upload error' });
	}
};

export default { getImages, uploadImage };
