import express from 'express';
import { login, register, registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Admin routes
router.post('/login', login);
router.post('/register', register);

// User routes
router.post('/user/login', loginUser);
router.post('/user/register', registerUser);

export default router;
