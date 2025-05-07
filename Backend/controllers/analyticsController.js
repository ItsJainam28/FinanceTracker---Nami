const Expense          = require("../models/expense");
const Budget           = require("../models/budget");
const RecurringExpense = require("../models/recurringExpense");

// helper: first / last day of a month
const monthRange = (y, m) => ({
  start: new Date(y, m, 1),
  end:   new Date(y, m + 1, 0, 23, 59, 59),
});

exports.getAnalyticsSummary = async (req, res) => {
  try {
    const now = new Date();
    const { start: startOfMonth } = monthRange(now.getFullYear(), now.getMonth());

    /* 1. ─ total spending & top categories (this month) */
    const spendThisMonth = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startOfMonth } } },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
    ]);
    const totalSpending = spendThisMonth.reduce((s, e) => s + e.total, 0);
    const topCategories = [...spendThisMonth]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    /* 2. ─ daily trend */
    const dailyTrend = await Expense.aggregate([
      { $match: { userId: req.user._id, date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    /* 3. ─ largest expenses */
    const largestExpenses = await Expense.find({
      userId: req.user._id,
      date: { $gte: startOfMonth },
    })
      .sort({ amount: -1 })
      .limit(5);

    /* 4. ─ budget vs spending (current month budgets) */
    const activeBudgets = await Budget.find({
      userId: req.user._id,
      year:  now.getFullYear(),
      month: now.getMonth() + 1,
    });

    const budgetVsSpending = await Promise.all(
      activeBudgets.map(async (b) => {
        const { start, end } = monthRange(b.year, b.month - 1);
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
        return {
          category: b.categories.length === 1 ? b.categories[0] : "Multi",
          budgetAmount: b.amount,
          spent: spentAgg[0]?.total || 0,
        };
      })
    );

    /* 5. ─ monthly expenses (last 6 months) */
    const MONTHS_BACK = 5;
    const monthlyComparison = [];

    for (let i = MONTHS_BACK; i >= 0; i--) {
      const dt = new Date(now.getFullYear(), now.getMonth() - i);
      const { start, end } = monthRange(dt.getFullYear(), dt.getMonth());

      const expAgg = await Expense.aggregate([
        { $match: { userId: req.user._id, date: { $gte: start, $lte: end } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]);

      monthlyComparison.push({
        month: `${dt.toLocaleString("default", {
          month: "short",
        })} ${dt.getFullYear()}`,
        expenses: expAgg[0]?.total || 0,
      });
    }

    /* 6. ─ upcoming recurring expenses (next 14 days) */
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

    /* ─ response ─ */
    res.json({
      totalSpending,
      topCategories,
      dailyTrend,
      budgetVsSpending,
      largestExpenses,
      monthlyComparison, // contains only expenses
      recurringExpenses,
    });
  } catch (err) {
    console.error("Analytics error:", err);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};
