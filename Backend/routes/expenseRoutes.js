import express from 'express';
import {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
} from '../controllers/expenseController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createExpense);
router.get('/', protect, getExpenses);
router.get('/:id', protect, getExpenseById);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);
router.delete('/bulk-delete', protect, bulkDeleteExpenses);

export default router;
