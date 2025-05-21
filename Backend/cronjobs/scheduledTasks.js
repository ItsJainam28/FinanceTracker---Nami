const cron = require("node-cron");
const RecurringExpense = require("../models/recurringExpense.js");
const Expense = require("../models/expense.js");
const RecurringBudget = require("../models/recurringBudget.js");
const Budget = require("../models/budget.js");

const runScheduledTasks = () => {
  cron.schedule("0 1 * * *", async () => {
    console.log("🔁 Running Scheduled Tasks...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔄 Process Recurring Expenses
    const scheduledExpenses = await RecurringExpense.find({
      nextTriggerDate: today,
      startDate: { $lte: today },
      $or: [{ endDate: null }, { endDate: { $gte: today } }],
    });

    for (const rec of scheduledExpenses) {
      // Move nextTriggerDate forward regardless of active state
      const next = new Date(rec.nextTriggerDate);
      next.setMonth(next.getMonth() + 1);
      rec.nextTriggerDate = next;

      if (rec.isActive) {
        // Check for existing logged expense
        const existing = await Expense.findOne({
          userId: rec.userId,
          date: today,
          fromRecurringId: rec._id,
          isRecurring: true,
        });

        if (!existing) {
          await Expense.create({
            userId: rec.userId,
            name: rec.name,
            amount: rec.amount,
            date: today,
            categoryId: rec.categoryId || null,
            budgetId: rec.budgetId || null,
            isRecurring: true,
            fromRecurringId: rec._id,
          });
        }
      }

      await rec.save();
    }

    // 🔄 Process Recurring Budgets
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const recurringBudgets = await RecurringBudget.find({
      isActive: true,
      $or: [
        { endMonth: null, endYear: null },
        {
          $expr: {
            $or: [
              { $gt: ["$endYear", currentYear] },
              {
                $and: [
                  { $eq: ["$endYear", currentYear] },
                  { $gte: ["$endMonth", currentMonth] },
                ],
              },
            ],
          },
        },
      ],
    });

    for (const rec of recurringBudgets) {
      const exists = await Budget.findOne({
        recurringBudgetId: rec._id,
        month: currentMonth,
        year: currentYear,
      });

      if (!exists) {
        await Budget.create({
          userId: rec.userId,
          recurringBudgetId: rec._id,
          amount: rec.amount,
          categories: rec.categories,
          month: currentMonth,
          year: currentYear,
        });
      }
    }

    console.log("✅ Scheduled Tasks Complete");
  });
};

module.exports = runScheduledTasks;
