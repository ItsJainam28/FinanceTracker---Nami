const express = require('express');
const {
  createBudget,
  getUserBudgets,
  getSingleBudget,
  updateBudget,
  deleteBudget,
  getBudgetMonthSummary
} = require('../controllers/budgetController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBudget);
router.get('/', protect, getUserBudgets);
router.get('/:id', protect, getSingleBudget);
router.patch('/:id', protect, updateBudget);
router.delete('/:id', protect, deleteBudget);
router.get('/:id/month-summary', protect, getBudgetMonthSummary);

module.exports = router;
