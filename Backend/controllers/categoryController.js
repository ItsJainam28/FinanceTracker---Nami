const Category = require('../models/category');

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;

    // Check if user already has category with same name
    const existingCategory = await Category.findOne({ userId: req.user._id, name });
    if (existingCategory) {
      return res.status(400).json({ error: "Category with this name already exists" });
    }

    const category = await Category.create({
      userId: req.user._id,
      name,
    });

    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all categories for current user
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Delete a category
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }
    res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createCategory,
  getCategories,
  deleteCategory,
};
