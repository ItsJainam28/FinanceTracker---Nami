import RecurringExpense from "../models/recurringExpense.js";
import Expense from "../models/expense.js";
import RecurringBudget from "../models/recurringBudget.js";
import Budget from "../models/budget.js";

// Helper function to add months to a UTC date with proper day capping
const addMonthsUTC = (date, months) => {
  const newDate = new Date(date);
  const originalDay = newDate.getUTCDate();
  const targetMonth = newDate.getUTCMonth() + months;
  
  // Set the month first
  newDate.setUTCMonth(targetMonth);
  
  // If we overflowed to the next month, it means the day doesn't exist
  // So we set it to the last day of the intended month
  const expectedMonth = ((targetMonth % 12) + 12) % 12; // Handle negative months
  if (newDate.getUTCMonth() !== expectedMonth) {
    // Go to last day of the intended month
    newDate.setUTCMonth(targetMonth + 1, 0); // Next month, day 0 = last day of target month
  }
  
  return newDate;
};

// Process missed recurring expenses (catch-up logic)
const processMissedExpenses = async (today) => {
  console.log("🔍 Checking for missed recurring expenses...");
  
  const missedExpenses = await RecurringExpense.find({
    isActive: true,
    nextTriggerDate: { $lt: today }, // Items that should have triggered before today
    startDate: { $lte: today },
    $or: [
      { endDate: null }, 
      { endDate: { $gte: today } }
    ],
  });

  console.log(`Found ${missedExpenses.length} recurring expenses with missed occurrences`);

  for (const rec of missedExpenses) {
    try {
      let currentTriggerDate = new Date(rec.nextTriggerDate);
      let missedCount = 0;

      // Process all missed occurrences up to today
      while (currentTriggerDate < today) {
        // Check if we already created an expense for this date
        const dayStart = new Date(currentTriggerDate);
        dayStart.setUTCHours(0, 0, 0, 0);
        const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000 - 1);

        const existing = await Expense.findOne({
          userId: rec.userId,
          recurringId: rec._id,
          date: { $gte: dayStart, $lte: dayEnd },
          isRecurring: true,
        });

        if (!existing) {
          // Create the missed expense
          const newExpense = await Expense.create({
            userId: rec.userId,
            name: rec.name,
            amount: rec.amount,
            date: currentTriggerDate,
            categoryId: rec.categoryId || null,
            budgetId: rec.budgetId || null,
            isRecurring: true,
            recurringId: rec._id,
          });

          console.log(`📅 Created missed expense: ${newExpense.name} for ${currentTriggerDate.toISOString()}`);
          missedCount++;
        }

        // Move to next occurrence
        currentTriggerDate = addMonthsUTC(currentTriggerDate, 1);
      }

      // Update the recurring expense with the correct next trigger date
      if (missedCount > 0) {
        rec.nextTriggerDate = currentTriggerDate;
        await rec.save();
        console.log(`✅ Caught up ${missedCount} missed occurrences for ${rec.name}`);
      }

    } catch (error) {
      console.error(`❌ Error processing missed expenses for ${rec.name} (ID: ${rec._id}):`, error);
    }
  }
};

// Main function to process recurring items
const processRecurringItems = async () => {
  const startTime = Date.now();
  let processedExpenses = 0;
  let processedBudgets = 0;
  let errors = 0;

  try {
    console.log("🔁 Starting Recurring Items Processing...");

    // Get today in UTC
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayEnd = new Date(today.getTime() + 24 * 60 * 60 * 1000 - 1);

    console.log(`Processing recurring items for UTC date: ${today.toISOString()}`);

    // 🔄 First, process any missed expenses (catch-up logic)
    await processMissedExpenses(today);

    // 🔄 Process Current Recurring Expenses
    const scheduledExpenses = await RecurringExpense.find({
      isActive: true,
      nextTriggerDate: { $lte: todayEnd },
      startDate: { $lte: today },
      $or: [
        { endDate: null }, 
        { endDate: { $gte: today } }
      ],
    });

    console.log(`Found ${scheduledExpenses.length} recurring expenses scheduled for today`);

    for (const rec of scheduledExpenses) {
      try {
        console.log(`Processing recurring expense: ${rec.name} (ID: ${rec._id})`);

        // Check if we've already created an expense for this recurring item today
        const existing = await Expense.findOne({
          userId: rec.userId,
          recurringId: rec._id,
          date: { $gte: today, $lte: todayEnd },
          isRecurring: true,
        });

        if (!existing) {
          // Create the expense entry
          const newExpense = await Expense.create({
            userId: rec.userId,
            name: rec.name,
            amount: rec.amount,
            date: new Date(rec.nextTriggerDate),
            categoryId: rec.categoryId || null,
            budgetId: rec.budgetId || null,
            isRecurring: true,
            recurringId: rec._id,
          });

          console.log(`✅ Created expense: ${newExpense.name} for ${newExpense.date.toISOString()}`);
          processedExpenses++;
        } else {
          console.log(`⏭️ Expense already exists for ${rec.name} on ${today.toISOString()}`);
        }

        // Move nextTriggerDate forward by one month
        const nextTriggerDate = addMonthsUTC(rec.nextTriggerDate, 1);
        rec.nextTriggerDate = nextTriggerDate;
        await rec.save();

      } catch (error) {
        console.error(`❌ Error processing recurring expense ${rec.name} (ID: ${rec._id}):`, error);
        errors++;
      }
    }

    // 🔄 Process Recurring Budgets
    const now = new Date();
    const currentMonth = now.getUTCMonth() + 1;
    const currentYear = now.getUTCFullYear();

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
          await Budget.create({
            userId: rec.userId,
            recurringBudgetId: rec._id,
            amount: rec.amount,
            categories: rec.categories,
            month: currentMonth,
            year: currentYear,
          });

          console.log(`✅ Created budget: ${rec.amount} for ${currentYear}-${currentMonth}`);
          processedBudgets++;
        } else {
          console.log(`⏭️ Budget already exists for ${currentYear}-${currentMonth}`);
        }
      } catch (error) {
        console.error(`❌ Error processing recurring budget (ID: ${rec._id}):`, error);
        errors++;
      }
    }

    const duration = Date.now() - startTime;
    const summary = {
      success: true,
      duration: `${duration}ms`,
      processedExpenses,
      processedBudgets,
      errors,
      timestamp: new Date().toISOString()
    };

    console.log("✅ Recurring Items Processing Complete", summary);
    return summary;

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("❌ Fatal error in recurring items processing:", error);
    
    return {
      success: false,
      error: error.message,
      duration: `${duration}ms`,
      processedExpenses,
      processedBudgets,
      errors: errors + 1,
      timestamp: new Date().toISOString()
    };
  }
};

// API endpoint handler for Vercel
// API endpoint handler for Vercel (updated for cron jobs)
export default async function handler(req, res) {
  // Allow both GET (for cron) and POST requests
  if (req.method !== 'POST' && req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Check if this is a cron job request (Vercel adds specific headers)
  const isCronJob = req.headers['x-vercel-cron'] === '1';
  
  // For cron jobs, skip API key check
  // For manual requests, check API key
  if (!isCronJob) {
    const apiKey = req.headers['x-api-key'] || req.body?.apiKey;
    if (process.env.RECURRING_API_KEY && apiKey !== process.env.RECURRING_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  try {
    console.log(`🔄 Processing triggered by: ${isCronJob ? 'Vercel Cron' : 'Manual Request'}`);
    
    const result = await processRecurringItems();
    
    // Return appropriate status code based on result
    const statusCode = result.success ? 200 : 500;
    res.status(statusCode).json({
      ...result,
      triggeredBy: isCronJob ? 'cron' : 'manual'
    });
    
  } catch (error) {
    console.error('API handler error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: new Date().toISOString(),
      triggeredBy: isCronJob ? 'cron' : 'manual'
    });
  }
}