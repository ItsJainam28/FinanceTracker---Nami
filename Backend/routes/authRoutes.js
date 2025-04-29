const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe } = require('../controllers/authController');
const { protect } = require("../middleware/authMiddleware");
// Signup Route
router.post('/signup', registerUser);

// Login Route
router.post('/login', loginUser);

// 🛡️ Protected route
router.get("/me", protect, getMe); 
module.exports = router;
