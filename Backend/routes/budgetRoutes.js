import express from "express";
import {
  getBudgetsForRecurring,
  getCurrentMonthBudgets,
  getArchivedRecurringBudgets,
  getRecurringBudgetsWithCurrentMonthUsage,
  getBudgetMonthSummary,
} from "../controllers/budgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;
