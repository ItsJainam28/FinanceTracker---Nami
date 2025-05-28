import express from "express";
import {
  createRecurringBudget,
  deactivateRecurringBudget,
  updateRecurringBudgetEndDate,
  getActiveRecurringBudgets,
  getArchivedRecurringBudgets,
  updateRecurringBudget
} from "../controllers/recurringBudgetController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

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

export default router;
