import express from 'express';
import { registerUser, loginUser, getMe } from '../controllers/authController.js';
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Signup Route
router.post('/signup', registerUser);

// Login Route
router.post('/login', loginUser);

// 🛡️ Protected route
router.get("/me", protect, getMe); 

export default router;
