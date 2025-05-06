const Expense = require("../models/expense");
const Budget = require("../models/budget");

const getAnalyticsSummary = async (req, res) => {
  try {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const today = new Date();

    // 1. Total spending this month
    const totalSpendingAgg = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);

    // 2. Top categories (current month)
    const topCategories = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: "$category", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 5 }
    ]);

    // 3. Daily expense trend (current month)
    const dailyTrend = await Expense.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$date" }
          },
          total: { $sum: "$amount" }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 4. Largest expenses (current month)
    const largestExpenses = await Expense.find({ date: { $gte: startOfMonth } })
      .sort({ amount: -1 })
      .limit(5);

    // 5. Budget vs spending (active budgets)
    const activeBudgets = await Budget.find({ endDate: { $gte: today } });

    const budgetVsSpending = await Promise.all(
      activeBudgets.map(async (budget) => {
        const spentAgg = await Expense.aggregate([
          {
            $match: {
              budgetId: budget._id,
              date: {
                $gte: budget.startDate,
                $lte: budget.endDate
              }
            }
          },
          {
            $group: { _id: null, total: { $sum: "$amount" } }
          }
        ]);

        return {
          category: budget.category,
          budgetAmount: budget.amount,
          spent: spentAgg[0]?.total || 0
        };
      })
    );

    res.json({
      totalSpending: totalSpendingAgg[0]?.total || 0,
      topCategories,
      dailyTrend,
      budgetVsSpending,
      largestExpenses
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({ error: "Failed to fetch analytics data" });
  }
};

module.exports = { getAnalyticsSummary };
