import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/userModel.js';

dotenv.config();

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.error('MongoDB connection error:', err));

const createAdmins = async () => {
	try {
		// Create first admin
		const firstAdmin = await User.findOne({
			email: 'adminKacpru@gmail.com',
		});
		if (!firstAdmin) {
			const newFirstAdmin = new User({
				name: 'Kacper',
				email: 'adminKacpru@gmail.com',
				password: 'adminKacpru88',
				isAdmin: true,
			});
			await newFirstAdmin.save();
			console.log('First admin user created successfully');
		} else {
			console.log('First admin already exists');
		}

		// Create second admin
		const secondAdmin = await User.findOne({
			email: 'adminDawid@gmail.com',
		});
		if (!secondAdmin) {
			const newSecondAdmin = new User({
				name: 'Dawid',
				email: 'adminDawid@gmail.com',
				password: 'adminDawid88',
				isAdmin: true,
			});
			await newSecondAdmin.save();
			console.log('Second admin user created successfully');
		} else {
			console.log('Second admin already exists');
		}

		console.log('Admin creation process completed');
		process.exit(0);
	} catch (error) {
		console.error('Error:', error);
		process.exit(1);
	}
};

createAdmins();
