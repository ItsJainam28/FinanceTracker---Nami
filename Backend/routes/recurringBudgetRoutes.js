const express = require("express");
const router = express.Router();
const {
  createRecurringBudget,
  deactivateRecurringBudget,
  updateRecurringBudgetEndDate,
  getActiveRecurringBudgets,
  getArchivedRecurringBudgets,
  updateRecurringBudget
} = require("../controllers/recurringBudgetController");
const { protect } = require("../middleware/authMiddleware");

// POST: Create a recurring budget
router.post("/", protect, createRecurringBudget);

// GET: All active recurring budgets
router.get("/active", protect, getActiveRecurringBudgets);

// GET: Archived/deactivated recurring budgets
router.get("/archived", protect, getArchivedRecurringBudgets);

// PATCH: Update a recurring budget
router.patch("/:id", protect, updateRecurringBudget);

// PATCH: Update end date of a recurring budget
router.patch("/:id/end-date", protect, updateRecurringBudgetEndDate);

// PATCH: Deactivate a recurring budget
router.patch("/:id/deactivate", protect, deactivateRecurringBudget);

module.exports = router;
