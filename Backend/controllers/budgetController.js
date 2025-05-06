const Budget = require("../models/budget");
const Expense = require("../models/expense");
const Category = require("../models/category");

// 1. Create Budget (for selected month/year)
const createBudget = async (req, res) => {
  try {
    const { month, year, amount, categories, isRecurring } = req.body;

    // Optional: prevent duplicate for same month/year
    const exists = await Budget.findOne({ userId: req.user._id, month, year, categories });
    if (exists) {
      return res.status(400).json({ error: "Budget for this month already exists" });
    }

    const budget = new Budget({
      userId: req.user._id,
      month,
      year,
      amount,
      categories,
      isRecurring,
    });

    await budget.save();
    res.status(201).json(budget);
  } catch (err) {
    console.error("Create budget error:", err);
    res.status(500).json({ error: "Failed to create budget" });
  }
};

// 2. Update Budget by ID
const updateBudget = async (req, res) => {
  try {
    const updates = req.body;
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json(budget);
  } catch (err) {
    console.error("Update budget error:", err);
    res.status(500).json({ error: "Failed to update budget" });
  }
};

// 3. Get all budgets
const getUserBudgets = async (req, res) => {
  try {
    const budgets = await Budget.find({ userId: req.user._id }).sort({ year: -1, month: -1 });
    res.status(200).json(budgets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budgets" });
  }
};

// 4. Get a single budget
const getSingleBudget = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });

    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json(budget);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch budget" });
  }
};

// 5. Delete budget
const deleteBudget = async (req, res) => {
  try {
    const deleted = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (!deleted) {
      return res.status(404).json({ error: "Budget not found" });
    }

    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete budget" });
  }
};

const getBudgetMonthSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const month  = Number(req.query.month);
    const year   = Number(req.query.year);

    if (!month || !year) {
      return res.status(400).json({ error: "month & year required" });
    }

    /* 1 ───────── Load budget */
    const budget = await Budget.findOne({ _id: id, userId: req.user._id });
    if (!budget) return res.status(404).json({ error: "Budget not found" });

    const start  = new Date(year, month - 1, 1);
    const end    = new Date(year, month, 0, 23, 59, 59);

    /* 2 ───────── Basic spend */
    const spendAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          categoryId: { $in: budget.categories },
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);
    const spent = spendAgg[0]?.total || 0;

    const remaining = Math.max(budget.amount - spent, 0);
    const percent   = Number(((spent / budget.amount) * 100).toFixed(1));

    /* 3 ───────── Category breakdown */
    //   • equal allocation per category (override later if you add custom weights)
    const catDocs        = await Category.find({ _id: { $in: budget.categories } });
    const perCatBudget   = budget.amount / budget.categories.length || 0;

    const catSpendAgg = await Expense.aggregate([
      {
        $match: {
          userId: req.user._id,
          categoryId: { $in: budget.categories },
          date: { $gte: start, $lte: end },
        },
      },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]);

    const spendByCat = Object.fromEntries(
      catSpendAgg.map((c) => [String(c._id), c.total])
    );

    const categoryBreakdown = catDocs.map((c) => ({
      name: c.name,
      amount: perCatBudget,
      spent: spendByCat[String(c._id)] || 0,
    }));

    /* 4 ───────── Historical data (previous 5 months + current) */
    const MONTHS_BACK = 5;
    const history = [];

    for (let i = MONTHS_BACK; i >= 0; i--) {
      const dt         = new Date(year, month - 1 - i);
      const histYear   = dt.getFullYear();
      const histMonth  = dt.getMonth() + 1;

      // Find matching budget in the same series (same cat set & recurring flag)
      const histBudget = await Budget.findOne({
        userId: req.user._id,
        categories: { $size: budget.categories.length, $all: budget.categories },
        month: histMonth,
        year: histYear,
      });

      if (!histBudget) continue; // skip if user had no budget that month

      const s = new Date(histYear, histMonth - 1, 1);
      const e = new Date(histYear, histMonth, 0, 23, 59, 59);

      const spentHistAgg = await Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            categoryId: { $in: histBudget.categories },
            date: { $gte: s, $lte: e },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      history.push({
        month: `${dt.toLocaleString("default", { month: "short" })} ${histYear}`,
        budget: histBudget.amount,
        spent: spentHistAgg[0]?.total || 0,
      });
    }

    res.json({
      amount: budget.amount,
      spent,
      remaining,
      percent,
      categoryBreakdown,
      historicalData: history,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

module.exports = {
  createBudget,
  updateBudget,
  getUserBudgets,
  getSingleBudget,
  deleteBudget,
  getBudgetMonthSummary,
};
