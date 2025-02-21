import Review from '../models/reviewModel.js';

export const getReviews = async (req, res) => {
	try {
		const reviews = await Review.find();
		res.status(200).json({ reviews });
	} catch (error) {
		console.error('Error fetching reviews', error);
		res.status(500).json({ message: 'Error fetching reviews' });
	}
};

export const addReview = async (req, res) => {
	try {
		const { author, rating, text } = req.body;
		const newReview = new Review({ author, rating, text });
		await newReview.save();
		res.status(201).json(newReview);
	} catch (error) {
		console.error('Error adding review', error);
		res.status(500).json({ message: 'Error adding review' });
	}
};
