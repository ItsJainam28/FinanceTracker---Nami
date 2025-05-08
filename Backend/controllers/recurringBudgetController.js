// src/controllers/recurringBudgetController.js
const RecurringBudget = require("../models/recurringBudget");
const Budget = require("../models/budget");
const { startOfMonth } = require("date-fns");

// 1. Create Recurring Budget
exports.createRecurringBudget = async (req, res) => {
  try {
    const { categories, amount, startDate, endDate } = req.body;
    const userId = req.user._id;
    const now = new Date();
    const start = new Date(startDate);

    // Start date must be current month
    if (start.getFullYear() !== now.getFullYear() || start.getMonth() !== now.getMonth()) {
      return res.status(400).json({ error: "Start month must be the current month." });
    }

    // End date (if provided) cannot be in the past
    if (endDate && new Date(endDate) < now) {
      return res.status(400).json({ error: "End date cannot be in the past." });
    }

    // Prevent duplicate category set
    const exists = await RecurringBudget.findOne({
      userId,
      categories: { $size: categories.length, $all: categories },
      isActive: true,
    });

    if (exists) {
      return res.status(400).json({ error: "A budget for these categories already exists." });
    }

    // Create recurring budget
    const recurring = new RecurringBudget({
      userId,
      categories,
      amount,
      startDate: startOfMonth(start),
      endDate: endDate ? startOfMonth(new Date(endDate)) : null,
    });
    await recurring.save();

    // Create first (current month) budget
    const currentBudget = new Budget({
      userId,
      recurringBudgetId: recurring._id,
      month: start.getMonth() + 1,
      year: start.getFullYear(),
      amount,
    });
    await currentBudget.save();

    res.status(201).json({ recurring, budget: currentBudget });
  } catch (err) {
    console.error("Create Recurring Budget Error:", err);
    res.status(500).json({ error: "Failed to create recurring budget." });
  }
};

// 2. Deactivate Recurring Budget
exports.deactivateRecurringBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recurring = await RecurringBudget.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!recurring) return res.status(404).json({ error: "Recurring budget not found." });

    const now = new Date();
    await Budget.updateMany(
      {
        recurringBudgetId: recurring._id,
        $or: [
          { year: { $gt: now.getFullYear() } },
          {
            year: now.getFullYear(),
            month: { $gte: now.getMonth() + 1 },
          },
        ],
      },
      { isArchived: true }
    );

    res.json({ message: "Recurring budget deactivated and associated budgets archived." });
  } catch (err) {
    console.error("Deactivate Recurring Budget Error:", err);
    res.status(500).json({ error: "Failed to deactivate budget." });
  }
};

// 3. Get All Active Recurring Budgets
exports.getRecurringBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const budgets = await RecurringBudget.find({ userId, isActive: true }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recurring budgets." });
  }
};
