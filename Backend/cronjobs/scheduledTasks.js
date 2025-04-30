const cron = require("node-cron");
const RecurringExpense = require("../models/recurringExpense.js");
const Expense = require("../models/expense.js");
const Budget = require("../models/budget.js");


const runScheduledTasks = () => {
  cron.schedule("0 1 * * *", async () => {
    console.log("🔁 Running Scheduled Tasks...");

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 🔄 Scheduled Expenses → Real Expense
    const scheduledExpenses = await RecurringExpense.find({
      nextTriggerDate: { $lte: today },
      isActive: true,
    });

    for (const rec of scheduledExpenses) {
      const newExpense = new Expense({
        userId: rec.userId,
        name: rec.name,
        amount: rec.amount,
        date: new Date(), // today's date
        categoryId: rec.categoryId || null,
        budgetId: rec.budgetId || null,
        isRecurring: true,
      });
      await newExpense.save();

      // move nextTriggerDate 1 month forward
      const next = new Date(rec.nextTriggerDate);
      next.setMonth(next.getMonth() + 1);
      rec.nextTriggerDate = next;
      await rec.save();
    }

    // 🔄 Scheduled Budgets → New Monthly Budget
    // 🔄 Budgets marked as recurring → New Monthly Budget
    const recurringBudgets = await Budget.find({
      isRecurring: true,
    });

    for (const rec of recurringBudgets) {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // check if this user already has same budget for this month/year
      const exists = await Budget.findOne({
        userId: rec.userId,
        name: rec.name,
        month: currentMonth,
        year: currentYear,
      });

      if (!exists) {
        const newBudget = new Budget({
          userId: rec.userId,
          name: rec.name,
          amount: rec.amount,
          isRecurring: true,
          month: currentMonth,
          year: currentYear,
        });
        await newBudget.save();
      }
    }

    console.log("✅ Scheduled Tasks Complete");
  });
};

export default runScheduledTasks;
