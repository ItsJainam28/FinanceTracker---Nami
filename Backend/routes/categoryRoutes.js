import express from 'express';
import {
  createCategory,
  getCategories,
  deleteCategory,
} from '../controllers/categoryController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createCategory);
router.get('/', protect, getCategories);
router.delete('/:id', protect, deleteCategory);

export default router;
