import cron from "node-cron";
import RecurringExpense from "../models/recurringExpense.js";
import Expense from "../models/expense.js";
import RecurringBudget from "../models/recurringBudget.js";
import Budget from "../models/budget.js";

// Helper function to add months to a UTC date with proper day handling
const addMonthsUTC = (date, months) => {
  const newDate = new Date(date);
  const originalDay = newDate.getUTCDate();
  
  // Set to first day of month to avoid day overflow issues
  newDate.setUTCDate(1);
  
  // Add the months
  const newMonth = newDate.getUTCMonth() + months;
  const newYear = newDate.getUTCFullYear() + Math.floor(newMonth / 12);
  const finalMonth = ((newMonth % 12) + 12) % 12; // Handle negative months
  
  newDate.setUTCFullYear(newYear);
  newDate.setUTCMonth(finalMonth);
  
  // Get last day of the target month
  const lastDayOfMonth = new Date(Date.UTC(newYear, finalMonth + 1, 0)).getUTCDate();
  
  // Set the day to original day or last day of month if original day doesn't exist
  const targetDay = Math.min(originalDay, lastDayOfMonth);
  newDate.setUTCDate(targetDay);
  
  return newDate;
};

const runScheduledTasks = () => {
  // Run at 1 AM UTC every day
  cron.schedule("0 1 * * *", async () => {
    console.log("🔁 Running Scheduled Tasks...");

    // Get today in UTC (this represents the current UTC date)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Set to midnight UTC for consistent comparison

    console.log(`Processing recurring items for UTC date: ${today.toISOString()}`);

    // 🔄 Process Recurring Expenses
    // Find expenses that should trigger today (UTC comparison)
    const scheduledExpenses = await RecurringExpense.find({
      isActive: true, // Only process active recurring expenses
      nextTriggerDate: {
        $lte: new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1) // End of today UTC
      },
      startDate: { $lte: today },
      $or: [
        { endDate: null }, 
        { endDate: { $gte: today } }
      ],
    });

    console.log(`Found ${scheduledExpenses.length} recurring expenses to process`);

    for (const rec of scheduledExpenses) {
      try {
        console.log(`Processing recurring expense: ${rec.name} (ID: ${rec._id})`);
        console.log(`Current nextTriggerDate: ${rec.nextTriggerDate.toISOString()}`);

        // Check if we've already created an expense for this recurring item today
        const existing = await Expense.findOne({
          userId: rec.userId,
          recurringId: rec._id, // Use the correct field name
          date: {
            $gte: today,
            $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000)
          },
          isRecurring: true,
        });

        if (!existing) {
          // Create the expense entry
          const newExpense = await Expense.create({
            userId: rec.userId,
            name: rec.name,
            amount: rec.amount,
            date: new Date(rec.nextTriggerDate), // Use the exact trigger date
            categoryId: rec.categoryId || null,
            budgetId: rec.budgetId || null,
            isRecurring: true,
            recurringId: rec._id, // Use the correct field name
          });

          console.log(`Created expense: ${newExpense.name} for ${newExpense.date.toISOString()}`);
        } else {
          console.log(`Expense already exists for ${rec.name} on ${today.toISOString()}`);
        }

        // Move nextTriggerDate forward by one month using proper UTC date math
        const nextTriggerDate = addMonthsUTC(rec.nextTriggerDate, 1);
        
        console.log(`Updating nextTriggerDate from ${rec.nextTriggerDate.toISOString()} to ${nextTriggerDate.toISOString()}`);
        
        rec.nextTriggerDate = nextTriggerDate;
        await rec.save();

        console.log(`Successfully processed recurring expense: ${rec.name}`);
      } catch (error) {
        console.error(`Error processing recurring expense ${rec.name} (ID: ${rec._id}):`, error);
        // Continue processing other items even if one fails
      }
    }

    // 🔄 Process Recurring Budgets
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1; // Use UTC month
    const currentYear = now.getUTCFullYear(); // Use UTC year

    console.log(`Processing recurring budgets for ${currentYear}-${currentMonth}`);

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

    console.log(`Found ${recurringBudgets.length} recurring budgets to process`);

    for (const rec of recurringBudgets) {
      try {
        const exists = await Budget.findOne({
          recurringBudgetId: rec._id,
          month: currentMonth,
          year: currentYear,
        });

        if (!exists) {
          const newBudget = await Budget.create({
            userId: rec.userId,
            recurringBudgetId: rec._id,
            amount: rec.amount,
            categories: rec.categories,
            month: currentMonth,
            year: currentYear,
          });

          console.log(`Created budget: ${rec.amount} for ${currentYear}-${currentMonth}`);
        } else {
          console.log(`Budget already exists for ${currentYear}-${currentMonth}`);
        }
      } catch (error) {
        console.error(`Error processing recurring budget (ID: ${rec._id}):`, error);
        // Continue processing other items even if one fails
      }
    }

    console.log("✅ Scheduled Tasks Complete");
  });

  console.log("📅 Cron job scheduled to run daily at 1 AM UTC");
};

export default runScheduledTasks;