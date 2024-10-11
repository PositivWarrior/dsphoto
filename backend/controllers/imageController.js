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
	const { title, description } = req.body;

	if (!title || !description || !req.file) {
		return res.status(400).json({
			message: 'Please provide all required fields, including the image',
		});
	}

	const imageUrl = `/uploads/${req.file.filename}`;

	try {
		const image = new Image({ title, description, imageUrl });

		const savedImage = await image.save();
		res.json(savedImage);
	} catch (error) {
		res.status(500).json({ message: 'Image upload error' });
	}
};

export default { getImages, uploadImage };
