import User from '../models/user.js';
import jwt from 'jsonwebtoken';
import Category from '../models/category.js';
// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Token valid for 30 days
  });
};

const defaultCategories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Personal Care',
  'Home & Garden',
  'Insurance',
  'Savings',
  'Income',
  'Gifts & Donations',
  'Other'
];

// Helper function to create default categories for a user
const createDefaultCategories = async (userId) => {
  try {
    const categoryPromises = defaultCategories.map(categoryName => 
      Category.create({
        userId: userId,
        name: categoryName
      })
    );
    
    await Promise.all(categoryPromises);
    console.log(`Created ${defaultCategories.length} default categories for user ${userId}`);
  } catch (error) {
    console.error('Error creating default categories:', error);
    // Don't throw error - registration should still succeed even if categories fail
  }
};

// @desc    Register a new user
// @route   POST /api/auth/signup
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { firstname, lastname, email, password, currency } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new user
    const user = await User.create({
      firstname,
      lastname,
      email,
      password,
      currency
    });

    if (user) {
      // Create default categories for the new user
      await createDefaultCategories(user._id);

      res.status(201).json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ error: 'Invalid user data' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.status(200).json({
        _id: user._id,
        firstname: user.firstname,
        lastname: user.lastname,
        email: user.email,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ error: 'Invalid email or password' });
    }

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

const getMe = async (req, res) => {
  try {
    const { firstname, lastname, email } = req.user;
    res.status(200).json({ firstname, lastname, email });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error fetching user data" });
  }
};

export {
  registerUser,
  loginUser,
  getMe
};
