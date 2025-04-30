const express = require('express');
const {
  createRecurringExpense,
  getAllRecurringExpenses,
  getSingleRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} = require("../controllers/recurringExpenseController.js");

const router = express.Router();

const { protect } = require('../middleware/authMiddleware.js');
router.post("/", protect, createRecurringExpense);
router.get("/", protect, getAllRecurringExpenses);
router.get("/:id", protect, getSingleRecurringExpense);
router.patch("/:id", protect, updateRecurringExpense);
router.delete("/:id", protect, deleteRecurringExpense);

module.exports = router;
