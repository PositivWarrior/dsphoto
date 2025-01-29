import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';

dotenv.config();

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
});

const question = (query) =>
	new Promise((resolve) => rl.question(query, resolve));

mongoose
	.connect(process.env.MONGO_URI)
	.then(() => console.log('MongoDB Connected'))
	.catch((err) => console.error('MongoDB connection error:', err));

import User from '../models/userModel.js';

const resetPassword = async () => {
	try {
		// Get all admin users
		const adminUsers = await User.find({ isAdmin: true });

		if (adminUsers.length === 0) {
			console.log('No admin users found');
			process.exit(1);
		}

		// Display available admin users
		console.log('\nAvailable admin users:');
		adminUsers.forEach((user, index) => {
			console.log(`${index + 1}. ${user.name} (${user.email})`);
		});

		// Ask which user to reset
		const userIndex =
			parseInt(
				await question(
					'\nEnter the number of the user to reset (or 0 to exit): ',
				),
			) - 1;

		if (userIndex === -1 || isNaN(userIndex)) {
			console.log('Exiting...');
			process.exit(0);
		}

		if (userIndex < 0 || userIndex >= adminUsers.length) {
			console.log('Invalid user selection');
			process.exit(1);
		}

		const selectedUser = adminUsers[userIndex];
		console.log(`\nResetting password for ${selectedUser.name}`);
		console.log('Current password hash:', selectedUser.password);

		const newPassword = await question('Enter new password: ');
		const confirmPassword = await question('Confirm new password: ');

		if (newPassword !== confirmPassword) {
			console.log('Passwords do not match');
			process.exit(1);
		}

		// Set the password and let the mongoose pre-save middleware handle the hashing
		selectedUser.password = newPassword;
		await selectedUser.save();

		// Verify the save
		const updatedUser = await User.findOne({ email: selectedUser.email });
		console.log('Saved password hash:', updatedUser.password);

		// Test password verification using the model's method
		const testMatch = await updatedUser.matchPassword(newPassword);
		console.log('Verification test:', testMatch ? 'SUCCESS' : 'FAILED');

		console.log('Password reset complete!');
		mongoose.connection.close();
		process.exit(0);
	} catch (error) {
		console.error('Error:', error);
		mongoose.connection.close();
		process.exit(1);
	} finally {
		rl.close();
	}
};

resetPassword();
