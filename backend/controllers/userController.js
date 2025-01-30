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
		// Check if we already have 2 admin users
		const adminCount = await User.countDocuments({ isAdmin: true });
		if (adminCount >= 2) {
			return res.status(403).json({
				message: 'Maximum number of admin users reached',
			});
		}

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
			isAdmin: true, // All users are admins in this case
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

		// Add logging to debug
		console.log('Login attempt:', { email, userFound: !!user });

		if (user && (await user.matchPassword(password))) {
			const token = generateToken(user._id);

			// Add more detailed user info in response
			res.json({
				_id: user._id,
				name: user.name,
				email: user.email,
				isAdmin: user.isAdmin,
				token,
			});
		} else {
			res.status(401).json({
				message: 'Invalid email or password',
				debug: { emailExists: !!user },
			});
		}
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};
