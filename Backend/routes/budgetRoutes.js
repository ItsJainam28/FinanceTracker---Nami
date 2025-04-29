const express = require('express');
const {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBudget);
router.get('/', protect, getBudgets);
router.get('/:id', protect, getBudgetById);
router.patch('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);

module.exports = router;
