const express = require('express');
const {
  createCategory,
  getCategories,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createCategory);
router.get('/', protect, getCategories);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
