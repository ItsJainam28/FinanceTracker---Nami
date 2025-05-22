const Expense = require("../models/expense");
const RecurringExpense = require("../models/recurringExpense");
const mongoose = require("mongoose");
const monthRange = (y, m) => ({
  start: new Date(y, m, 1),
  end: new Date(y, m + 1, 0, 23, 59, 59),
});
const getAnalyticsSummary = async (req, res) => {
  try {
    const now = new Date();
    const { start: startOfMonth } = monthRange(now.getFullYear(), now.getMonth());

    const MONTHS_BACK = 5;
    const monthRanges = Array.from({ length: MONTHS_BACK + 1 }).map((_, i) => {
      const dt = new Date(now.getFullYear(), now.getMonth() - MONTHS_BACK + i);
      const { start, end } = monthRange(dt.getFullYear(), dt.getMonth());
      return {
        label: `${dt.toLocaleString("default", { month: "short" })} ${dt.getFullYear()}`,
        start,
        end,
      };
    });

    // Optimized single aggregation for topCategories, dailyTrend, totalSpending
    const [summaryAgg] = await Expense.aggregate([
      { $match: { userId: req.user._id } },
      {
        $facet: {
          topCategories: [
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $limit: 5 },
          ],
          dailyTrend: [
            { $match: { date: { $gte: startOfMonth } } },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                total: { $sum: "$amount" },
              },
            },
            { $sort: { _id: 1 } },
          ],
          totalSpending: [
            { $match: { date: { $gte: startOfMonth } } },
            { $group: { _id: null, total: { $sum: "$amount" } } },
          ],
        },
      },
    ]);

    // Parallel monthly comparison (last 6 months)
    const monthlyComparison = await Promise.all(
      monthRanges.map(async ({ label, start, end }) => {
        const agg = await Expense.aggregate([
          {
            $match: {
              userId: req.user._id,
              date: { $gte: start, $lte: end },
            },
          },
          { $group: { _id: null, total: { $sum: "$amount" } } },
        ]);
        return {
          month: label,
          expenses: agg[0]?.total || 0,
        };
      })
    );

    // Top 5 largest expenses this month
    const largestExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth },
    })
      .sort({ amount: -1 })
      .limit(5);

    // Upcoming recurring expenses in next 14 days
    const in14 = new Date();
    in14.setDate(in14.getDate() + 14);
    const upcoming = await RecurringExpense.find({
      userId: req.user._id,
      nextTriggerDate: { $gte: now, $lte: in14 },
      isActive: true,
    }).select("name amount nextTriggerDate");

    const recurringExpenses = upcoming.map((e) => ({
      name: e.name,
      amount: e.amount,
      dueDate: e.nextTriggerDate.toISOString().split("T")[0],
    }));

    // Safe extraction of top-level data
    const totalSpending = summaryAgg.totalSpending?.[0]?.total || 0;

    res.json({
      totalSpending,
      topCategories: summaryAgg.topCategories || [],
      dailyTrend: summaryAgg.dailyTrend || [],
      largestExpenses,
      monthlyComparison,
      recurringExpenses,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};


const Budget = require("../models/budget");

const getBudgetTracking = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Get budgets for current month
    const budgets = await Budget.find({
      userId,
      month: currentMonth,
      year: currentYear,
      isArchived: false,
    });

    // Map category -> budget amount
    const categoryBudgetMap = {};

    budgets.forEach((b) => {
      const perCategory = b.amount / b.categories.length;
      b.categories.forEach((catId) => {
        const key = String(catId);
        categoryBudgetMap[key] = (categoryBudgetMap[key] || 0) + perCategory;
      });
    });

    // Aggregate expenses by category
    const { start, end } = {
      start: new Date(currentYear, currentMonth - 1, 1),
      end: new Date(currentYear, currentMonth, 0, 23, 59, 59),
    };

    const expensesAgg = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end },
          categoryId: { $in: Object.keys(categoryBudgetMap).map(id => new mongoose.Types.ObjectId(id)) },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          spent: { $sum: "$amount" },
        },
      },
    ]);

    const result = Object.entries(categoryBudgetMap).map(([categoryId, budget]) => {
      const match = expensesAgg.find(e => String(e._id) === categoryId);
      return {
        categoryId,
        budget: Math.round(budget * 100) / 100,
        spent: match ? Math.round(match.spent * 100) / 100 : 0,
      };
    });

    res.json(result);
  } catch (err) {
    console.error("Budget tracking error:", err);
    res.status(500).json({ error: "Failed to fetch budget tracking data" });
  }
};

const getCumulativeSpending = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0, 23, 59, 59);

    const raw = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: start, $lte: end },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Build cumulative array
    const output = [];
    let runningTotal = 0;
    raw.forEach((entry) => {
      runningTotal += entry.total;
      output.push({ day: entry._id, total: Math.round(runningTotal * 100) / 100 });
    });

    res.json(output);
  } catch (err) {
    console.error("Cumulative spending error:", err);
    res.status(500).json({ error: "Failed to fetch cumulative spending" });
  }
};


module.exports = { getAnalyticsSummary, getBudgetTracking, getCumulativeSpending };
