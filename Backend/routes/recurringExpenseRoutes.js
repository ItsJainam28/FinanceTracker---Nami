const express = require("express");
const {
  createRecurringExpense,
  getAllRecurringExpenses,
  getSingleRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringStatus,
  getSummary,
} = require("../controllers/recurringExpenseController.js");

const { protect } = require("../middleware/authMiddleware.js");
const router = express.Router();

router.post("/", protect, createRecurringExpense);
router.get("/summary", protect, getSummary);           // ✅ BEFORE "/:id"
router.patch("/:id/toggle", protect, toggleRecurringStatus);
router.get("/", protect, getAllRecurringExpenses);
router.get("/:id", protect, getSingleRecurringExpense); // ❗ AFTER "/summary"
router.patch("/:id", protect, updateRecurringExpense);
router.delete("/:id", protect, deleteRecurringExpense);

module.exports = router;
