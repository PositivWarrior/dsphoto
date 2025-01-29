import User from '../models/userModel.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Generate JWT token
const generateToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: '30d',
	});
};

export const registerUser = async (req, res) => {
	const { name, email, password } = req.body;

	try {
		// Check if the user already exists
		const userExists = await User.findOne({ email });
		if (userExists) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Create a new user
		const user = await User.create({
			name,
			email,
			password,
			isAdmin: true,
		});

		if (user) {
			res.status(201).json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				token: generateToken(user._id),
			});
		} else {
			res.status(400).json({ message: 'Invalid user data' });
		}
	} catch (error) {
		res.status(500).json({ message: 'Server Error' });
	}
};

export const loginUser = async (req, res) => {
	try {
		const { email, password } = req.body;
		const user = await User.findOne({ email });

		console.log('Login attempt details:');
		console.log('Email:', email);
		console.log('User found:', !!user);

		if (!user) {
			return res
				.status(401)
				.json({ message: 'Invalid email or password' });
		}

		const isMatch = await user.matchPassword(password);
		console.log('Password match result:', isMatch);

		if (!isMatch) {
			return res
				.status(401)
				.json({ message: 'Invalid email or password' });
		}

		const token = jwt.sign(
			{ id: user._id, isAdmin: user.isAdmin, name: user.name },
			process.env.JWT_SECRET,
			{ expiresIn: '30d' },
		);

		res.json({
			_id: user._id,
			name: user.name,
			email: user.email,
			isAdmin: user.isAdmin,
			token,
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error' });
	}
};
