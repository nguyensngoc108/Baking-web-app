import express from 'express';
import { getUserProfile } from '../controllers/userController.js';
import { verifyUser } from '../middleware/authMiddleware.js';

const router = express.Router();


// Get user profile
router.get('/profile', verifyUser, getUserProfile);

export default router;