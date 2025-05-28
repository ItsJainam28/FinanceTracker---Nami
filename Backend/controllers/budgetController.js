import RecurringBudget from "../models/recurringBudget.js";
import Budget from "../models/budget.js";
import Expense from "../models/expense.js";
import Category from "../models/category.js";
import mongoose from "mongoose";

// Helper: get start & end of a month
const getMonthRange = (year, month) => {
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  return { start, end };
};

// 1. Timeline of all budgets for a recurring budget
const getBudgetsForRecurring = async (req, res) => {
  try {
    const recurringId = req.params.id;
    const budgets = await Budget.find({
      userId: req.user._id,
      recurringBudgetId: recurringId,
    }).sort({ year: 1, month: 1 });

    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch budget timeline" });
  }
};

// 2. Current month budgets only
const getCurrentMonthBudgets = async (req, res) => {
  try {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    const budgets = await Budget.find({
      userId: req.user._id,
      month,
      year,
    });

    res.json(budgets);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch current budgets" });
  }
};

// 3. Archived recurring budgets (past end date or deactivated)
const getArchivedRecurringBudgets = async (req, res) => {
  try {
    const now = new Date();
    const archived = await RecurringBudget.find({
      userId: req.user._id,
      $or: [{ isActive: false }, { endDate: { $lt: now } }],
    });

    res.json(archived);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch archived budgets" });
  }
};

// 4. Active recurring budgets with current month's usage
const getRecurringBudgetsWithCurrentMonthUsage = async (req, res) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();
    const userId = req.user._id;

    const recurringBudgets = await RecurringBudget.find({
      userId,
      isActive: true,
      $or: [
        { endYear: null, endMonth: null },
        {
          $or: [
            { endYear: { $gt: currentYear } },
            { endYear: currentYear, endMonth: { $gte: currentMonth } },
          ],
        },
      ],
    }).sort({ createdAt: -1 });

    const recurringIds = recurringBudgets.map((r) => r._id);

    const budgets = await Budget.find({
      userId: req.user._id,
      recurringBudgetId: { $in: recurringIds },
      month: currentMonth,
      year: currentYear,
    });

    const usageMap = {};
    for (const b of budgets) {
      const { start, end } = getMonthRange(b.year, b.month);
      const spentAgg = await Expense.aggregate([
        {
          $match: {
            userId: req.user._id,
            categoryId: { $in: b.categories },
            date: { $gte: start, $lte: end },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);
      const spent = spentAgg[0]?.total || 0;
      const percent = Number(((spent / b.amount) * 100).toFixed(1));
      usageMap[String(b.recurringBudgetId)] = { spent, percent };
    }

    const output = recurringBudgets.map((r) => {
      const usage = usageMap[String(r._id)] || { spent: 0, percent: 0 };
      return {
        ...r.toObject(),
        currentMonth: { spent: usage.spent, percent: usage.percent },
      };
    });

    res.json(output);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to load recurring budget usage" });
  }
};

// 5. Get full summary for a specific budget in a month
const getBudgetMonthSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const month = parseInt(req.query.month);
    const year = parseInt(req.query.year);
    const userId = req.user._id;

    const budget = await Budget.findOne({ _id: id, userId }).populate("categories");
    if (!budget) return res.status(404).json({ error: "Budget not found" });

    const { start, end } = getMonthRange(year, month);
    const categoryIds = budget.categories.map(c => c._id || c);

    const expenses = await Expense.aggregate([
      {
        $match: {
          userId,
          categoryId: { $in: categoryIds },
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
        },
      },
    ]);

    const spentMap = Object.fromEntries(expenses.map(e => [e._id.toString(), e.total]));
    const spentTotal = expenses.reduce((s, e) => s + e.total, 0);
    const remaining = budget.amount - spentTotal;
    const percent = Number(((spentTotal / budget.amount) * 100).toFixed(1));

    const categoryBreakdown = budget.categories.map(cat => ({
      name: cat.name,
      amount: budget.amount / budget.categories.length,
      spent: spentMap[cat._id.toString()] || 0,
    }));

    const historicalData = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(year, month - 1 - i);
      const m = d.getMonth() + 1;
      const y = d.getFullYear();
      const range = getMonthRange(y, m);

      const b = await Budget.findOne({
        userId,
        recurringBudgetId: budget.recurringBudgetId,
        month: m,
        year: y,
      });

      let totalSpent = 0;
      if (b) {
        const expenseAgg = await Expense.aggregate([
          {
            $match: {
              userId,
              categoryId: { $in: b.categories },
              date: { $gte: range.start, $lte: range.end },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        totalSpent = expenseAgg[0]?.total || 0;
      }

      historicalData.push({
        month: `${d.toLocaleString("default", { month: "short" })} ${y}`,
        spent: totalSpent,
        budget: b?.amount || 0,
      });
    }

    res.json({
      amount: budget.amount,
      spent: spentTotal,
      remaining,
      percent,
      categoryBreakdown,
      historicalData,
    });
  } catch (err) {
    console.error("Budget summary error:", err);
    res.status(500).json({ error: "Failed to load budget summary" });
  }
};

export {
  getBudgetsForRecurring,
  getCurrentMonthBudgets,
  getArchivedRecurringBudgets,
  getRecurringBudgetsWithCurrentMonthUsage,
  getBudgetMonthSummary,
};
