const express = require("express");
const router = express.Router();
const {
  getBudgetsForRecurring,
  getCurrentMonthBudgets,
  getArchivedRecurringBudgets,
  getRecurringBudgetsWithCurrentMonthUsage,
  getBudgetMonthSummary,
} = require("../controllers/budgetController");
const {protect} = require("../middleware/authMiddleware");

// GET: Budgets linked to a recurring budget (timeline)
router.get("/recurring/:id/timeline", protect, getBudgetsForRecurring);

// GET: Budgets only for current month
router.get("/current", protect, getCurrentMonthBudgets);

// GET: Archived recurring budgets
router.get("/archived-recurring", protect, getArchivedRecurringBudgets);

// GET: All active recurring budgets + current month usage
router.get("/with-usage", protect, getRecurringBudgetsWithCurrentMonthUsage);

// GET: Budget month summary
router.get("/:id/month-summary", protect, getBudgetMonthSummary);

module.exports = router;
