import express from 'express';
import { registerUser, loginUser } from '../controllers/userController.js';

const router = express.Router();

// Register new admin user
router.post('/register', registerUser);

// Login admin user
router.post('/login', loginUser);

export default router;
