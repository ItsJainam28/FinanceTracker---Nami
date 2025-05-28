import express from "express";
import {
  createRecurringExpense,
  getAllRecurringExpenses,
  getSingleRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringStatus,
  getSummary,
} from "../controllers/recurringExpenseController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, createRecurringExpense);
router.get("/summary", protect, getSummary);           // ✅ BEFORE "/:id"
router.patch("/:id/toggle", protect, toggleRecurringStatus);
router.get("/", protect, getAllRecurringExpenses);
router.get("/:id", protect, getSingleRecurringExpense); // ❗ AFTER "/summary"
router.patch("/:id", protect, updateRecurringExpense);
router.delete("/:id", protect, deleteRecurringExpense);

export default router;
