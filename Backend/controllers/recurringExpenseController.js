import RecurringExpense from "../models/recurringExpense.js";
import Expense from "../models/expense.js";

// Helper function to create UTC date from date string, preserving the intended date in user's timezone
const createUTCDateFromUserDate = (dateString, userTimezone = 'UTC') => {
  if (dateString.includes('T')) {
    return new Date(dateString);
  }
  
  // Parse the date components
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create date at midnight in user's timezone, then convert to UTC
  // This preserves the intended date regardless of timezone offset
  const tempDate = new Date(year, month - 1, day, 0, 0, 0, 0);
  
  // Get timezone offset for this specific date (handles DST)
  const offsetMs = tempDate.getTimezoneOffset() * 60 * 1000;
  
  // If we have a specific timezone, calculate the offset difference
  if (userTimezone !== 'UTC') {
    // Create formatter to get date in user's timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    // Create a reference date to check timezone offset
    const referenceDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon to avoid DST issues
    const userDateStr = formatter.format(referenceDate);
    const [userYear, userMonth, userDay] = userDateStr.split('-').map(Number);
    
    // If the dates match, create UTC date representing midnight in user's timezone
    if (userYear === year && userMonth === month && userDay === day) {
      // Create the date at midnight in the user's timezone
      const userMidnight = new Date(`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T00:00:00`);
      
      // Get what this time would be in the user's timezone
      const userTimezoneMidnight = new Date(userMidnight.toLocaleString("en-US", { timeZone: userTimezone }));
      const utcMidnight = new Date(userMidnight.toLocaleString("en-US", { timeZone: "UTC" }));
      
      // Calculate the offset and adjust
      const timezoneOffset = utcMidnight.getTime() - userTimezoneMidnight.getTime();
      
      return new Date(userMidnight.getTime() + timezoneOffset);
    }
  }
  
  // Fallback: create UTC date (original behavior)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

// Better helper function to create date at midnight in user's timezone
const createDateAtMidnightInTimezone = (dateString, userTimezone) => {
  const [year, month, day] = dateString.split('-').map(Number);
  
  // Create a temporary date to find the timezone offset
  const tempDate = new Date(year, month - 1, day, 12, 0, 0, 0); // Use noon to avoid DST edge cases
  
  // Format this date in the user's timezone to verify it's the correct date
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const formattedDate = formatter.format(tempDate);
  const expectedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  
  if (formattedDate === expectedDate) {
    // Find midnight in the user's timezone
    // We need to find what UTC time corresponds to midnight in the user's timezone
    
    // Start with the date at midnight UTC
    let candidateDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
    
    // Check what date this represents in the user's timezone
    let checkFormatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: userTimezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    
    let resultingDate = checkFormatter.format(candidateDate);
    
    // If the resulting date is different, we need to adjust
    if (resultingDate !== expectedDate) {
      // Try adjusting by timezone offset
      const offsetMinutes = tempDate.getTimezoneOffset();
      candidateDate = new Date(Date.UTC(year, month - 1, day, Math.abs(offsetMinutes) / 60, 0, 0, 0));
      
      // Check again
      resultingDate = checkFormatter.format(candidateDate);
      
      if (resultingDate !== expectedDate) {
        // Manual approach: find the exact UTC time that gives us midnight in user timezone
        for (let hour = 0; hour < 24; hour++) {
          const testDate = new Date(Date.UTC(year, month - 1, day, hour, 0, 0, 0));
          const testResult = checkFormatter.format(testDate);
          
          if (testResult === expectedDate) {
            // Also check if this is actually midnight in the user's timezone
            const timeFormatter = new Intl.DateTimeFormat('en-US', {
              timeZone: userTimezone,
              hour: '2-digit',
              minute: '2-digit',
              hour12: false
            });
            
            const timeInTz = timeFormatter.format(testDate);
            if (timeInTz === '00:00') {
              candidateDate = testDate;
              break;
            }
          }
        }
      }
    }
    
    return candidateDate;
  }
  
  // Fallback to UTC if we can't resolve the timezone properly
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
};

// Helper function to get today in user's timezone (as date only)
const getTodayInUserTimezone = (userTimezone) => {
  const now = new Date();
  
  // Get current date in user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', { 
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const todayString = formatter.format(now); // Returns "YYYY-MM-DD"
  
  // Create date at midnight in user's timezone
  return createDateAtMidnightInTimezone(todayString, userTimezone);
};

// Helper function to format date for user's timezone
const formatDateForUserTimezone = (date, userTimezone) => {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(date);
};

// Helper function to format datetime for user's timezone
const formatDateTimeForUserTimezone = (date, userTimezone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZoneName: 'short'
  });
  return formatter.format(date);
};

// Helper function to check if two dates are in same month/year (in user's timezone)
const isSameMonthYearInTimezone = (date1, date2, userTimezone) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: userTimezone,
    year: 'numeric',
    month: 'numeric'
  });
  
  const date1Parts = formatter.formatToParts(date1);
  const date2Parts = formatter.formatToParts(date2);
  
  const date1Month = date1Parts.find(p => p.type === 'month').value;
  const date1Year = date1Parts.find(p => p.type === 'year').value;
  const date2Month = date2Parts.find(p => p.type === 'month').value;
  const date2Year = date2Parts.find(p => p.type === 'year').value;
  
  return date1Month === date2Month && date1Year === date2Year;
};

// Helper function to add months to a date while preserving the date in user's timezone
const addMonthsInTimezone = (date, months, userTimezone) => {
  // Get the date components in the user's timezone
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: userTimezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  
  const dateStr = formatter.format(date);
  const [year, month, day] = dateStr.split('-').map(Number);
  
  // Calculate new month and year
  const totalMonths = (year * 12) + month - 1 + months; // Convert to 0-based months
  const newYear = Math.floor(totalMonths / 12);
  const newMonth = (totalMonths % 12) + 1; // Convert back to 1-based
  
  // Handle day overflow
  const lastDayOfMonth = new Date(newYear, newMonth, 0).getDate();
  const newDay = Math.min(day, lastDayOfMonth);
  
  // Create the new date string and convert back to UTC date at midnight in user's timezone
  const newDateStr = `${newYear}-${newMonth.toString().padStart(2, '0')}-${newDay.toString().padStart(2, '0')}`;
  
  return createDateAtMidnightInTimezone(newDateStr, userTimezone);
};

// Helper function to convert date to user timezone info
const getDateInUserTimezone = (date, userTimezone) => {
  const userDate = formatDateForUserTimezone(date, userTimezone);
  const userDateTime = formatDateTimeForUserTimezone(date, userTimezone);
  
  return {
    utc: date.toISOString(),
    userDate,
    userDateTime,
    userTimezone
  };
};

// Helper function to get start and end of day in user's timezone
const getDayBoundariesInUserTimezone = (dateString, userTimezone) => {
  // Get midnight in user's timezone for the given date
  const startOfDay = createDateAtMidnightInTimezone(dateString, userTimezone);
  
  // End of day is 23:59:59.999 of the same date in user's timezone
  const endOfDay = new Date(startOfDay.getTime() + (24 * 60 * 60 * 1000) - 1);
  
  return { startOfDay, endOfDay };
};

const createRecurringExpense = async (req, res) => {
  try {
    const { 
      name, 
      amount, 
      categoryId, 
      startDate, 
      endDate, 
      logIfPast,
      userTimezone = 'UTC'
    } = req.body;
    
    const userId = req.user._id;

    // Create dates at midnight in user's timezone
    const start = createDateAtMidnightInTimezone(startDate, userTimezone);
    const end = endDate ? createDateAtMidnightInTimezone(endDate, userTimezone) : null;

    // Get today in user's timezone for comparison
    const todayInUserTZ = getTodayInUserTimezone(userTimezone);

    console.log("Parsed start date (UTC):", start.toISOString());
    console.log("Start date in user TZ:", formatDateForUserTimezone(start, userTimezone));
    console.log("Today in user timezone:", formatDateForUserTimezone(todayInUserTZ, userTimezone));
    console.log("User timezone:", userTimezone);

    const recurring = new RecurringExpense({
      userId,
      name,
      amount,
      categoryId: categoryId || null,
      budgetId: null,
      startDate: start,
      endDate: end,
      nextTriggerDate: new Date(start),
      userTimezone,
    });

    await recurring.save();
    console.log("Recurring expense created:", recurring);

    // Check if start date is in the past but in current month (in user's timezone)
    const isPastInCurrentMonth = start < todayInUserTZ && 
                                isSameMonthYearInTimezone(start, todayInUserTZ, userTimezone);
    
    console.log("Is past in current month (user timezone):", isPastInCurrentMonth);

    if (isPastInCurrentMonth && logIfPast) {
      await Expense.create({
        userId,
        categoryId: categoryId || null,
        name,
        amount,
        date: start,
        isRecurring: true,
        recurringId: recurring._id,
      });

      // Add one month while preserving the date in user's timezone
      const nextTriggerDate = addMonthsInTimezone(start, 1, userTimezone);
      
      console.log("Next trigger date set to:", nextTriggerDate.toISOString());
      console.log("Next trigger date in user TZ:", formatDateForUserTimezone(nextTriggerDate, userTimezone));
      
      recurring.nextTriggerDate = nextTriggerDate;
      await recurring.save();
    }

    // Return response with timezone-aware dates
    const response = {
      ...recurring.toObject(),
      startDate: getDateInUserTimezone(recurring.startDate, userTimezone),
      endDate: recurring.endDate ? getDateInUserTimezone(recurring.endDate, userTimezone) : null,
      nextTriggerDate: getDateInUserTimezone(recurring.nextTriggerDate, userTimezone)
    };

    res.status(201).json(response);
  } catch (err) {
    console.error("Create recurring error:", err);
    res.status(500).json({ error: "Failed to create recurring expense" });
  }
};

const getAllRecurringExpenses = async (req, res) => {
  try {
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    const data = await RecurringExpense.find({ userId: req.user._id });
    
    // Transform dates to include user timezone information
    const transformedData = data.map(item => ({
      ...item.toObject(),
      startDate: getDateInUserTimezone(item.startDate, userTimezone),
      endDate: item.endDate ? getDateInUserTimezone(item.endDate, userTimezone) : null,
      nextTriggerDate: getDateInUserTimezone(item.nextTriggerDate, userTimezone),
      userTimezone: item.userTimezone || userTimezone
    }));
    
    res.status(200).json(transformedData);
  } catch (err) {
    console.error("Get all recurring error:", err);
    res.status(500).json({ error: "Failed to fetch recurring expenses" });
  }
};

const getSingleRecurringExpense = async (req, res) => {
  try {
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    const item = await RecurringExpense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    
    if (!item) return res.status(404).json({ error: "Not found" });
    
    // Transform dates to include user timezone information
    const response = {
      ...item.toObject(),
      startDate: getDateInUserTimezone(item.startDate, userTimezone),
      endDate: item.endDate ? getDateInUserTimezone(item.endDate, userTimezone) : null,
      nextTriggerDate: getDateInUserTimezone(item.nextTriggerDate, userTimezone),
      userTimezone: item.userTimezone || userTimezone
    };
    
    res.status(200).json(response);
  } catch (err) {
    console.error("Get single recurring error:", err);
    res.status(500).json({ error: "Failed to fetch recurring expense" });
  }
};

const updateRecurringExpense = async (req, res) => {
  try {
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    const allowedFields = ["name", "amount", "endDate", "isActive"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        if (field === 'endDate' && req.body[field]) {
          updates[field] = createDateAtMidnightInTimezone(req.body[field], userTimezone);
        } else {
          updates[field] = req.body[field];
        }
      }
    }

    const updated = await RecurringExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });

    // Transform dates to include user timezone information
    const response = {
      ...updated.toObject(),
      startDate: getDateInUserTimezone(updated.startDate, userTimezone),
      endDate: updated.endDate ? getDateInUserTimezone(updated.endDate, userTimezone) : null,
      nextTriggerDate: getDateInUserTimezone(updated.nextTriggerDate, userTimezone),
      userTimezone: updated.userTimezone || userTimezone
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Update recurring error:", err);
    res.status(400).json({ error: "Failed to update recurring expense" });
  }
};

const deleteRecurringExpense = async (req, res) => {
  try {
    const deleted = await RecurringExpense.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!deleted) return res.status(404).json({ error: "Not found" });

    res.status(200).json({ message: "Deleted successfully" });
  } catch (err) {
    console.error("Delete recurring error:", err);
    res.status(500).json({ error: "Failed to delete recurring expense" });
  }
};

const toggleRecurringStatus = async (req, res) => {
  try {
    const recurring = await RecurringExpense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!recurring) return res.status(404).json({ error: "Not found" });

    recurring.isActive = !recurring.isActive;
    await recurring.save();

    res.status(200).json({ isActive: recurring.isActive });
  } catch (err) {
    console.error("Toggle recurring status error:", err);
    res.status(500).json({ error: "Failed to toggle recurring status" });
  }
};

const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    
    // Get today in user's timezone
    const todayInUserTZ = getTodayInUserTimezone(userTimezone);

    const recurringExpenses = await RecurringExpense.find({
      userId,
      isActive: true,
      startDate: { $lte: todayInUserTZ },
      $or: [
        { endDate: null },
        { endDate: { $gte: todayInUserTZ } }
      ],
    });

    const totalMonthlySpend = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);

    const sorted = [...recurringExpenses].sort(
      (a, b) => new Date(a.nextTriggerDate) - new Date(b.nextTriggerDate)
    );

    const next = sorted[0];

    // Calculate a week from now in user's timezone
    const weekFromNowInUserTZ = new Date(todayInUserTZ.getTime() + (7 * 24 * 60 * 60 * 1000));

    const upcomingList = sorted.filter(
      (r) => r.nextTriggerDate >= todayInUserTZ && r.nextTriggerDate <= weekFromNowInUserTZ
    );

    res.status(200).json({
      totalMonthlySpend,
      nextPaymentName: next?.name || null,
      nextPaymentDate: next ? getDateInUserTimezone(next.nextTriggerDate, userTimezone) : null,
      upcomingCount: upcomingList.length,
      upcomingList: upcomingList.map((r) => ({
        _id: r._id,
        name: r.name,
        amount: r.amount,
        nextTriggerDate: getDateInUserTimezone(r.nextTriggerDate, userTimezone),
      })),
      userTimezone,
      todayInUserTimezone: getDateInUserTimezone(todayInUserTZ, userTimezone)
    }); 
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
  }
};

const getExpensesByDateRange = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    // Get boundaries for start and end dates in user's timezone
    const { startOfDay: rangeStart } = getDayBoundariesInUserTimezone(startDate, userTimezone);
    const { endOfDay: rangeEnd } = getDayBoundariesInUserTimezone(endDate, userTimezone);

    console.log(`Date range query - User TZ: ${userTimezone}`);
    console.log(`Range start (UTC): ${rangeStart.toISOString()}`);
    console.log(`Range end (UTC): ${rangeEnd.toISOString()}`);

    // Query expenses within the date range
    const expenses = await Expense.find({
      userId,
      date: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    }).populate('categoryId').sort({ date: -1 });

    // Transform expenses to include timezone information
    const transformedExpenses = expenses.map(expense => ({
      ...expense.toObject(),
      date: getDateInUserTimezone(expense.date, userTimezone),
      userTimezone
    }));

    res.status(200).json({
      expenses: transformedExpenses,
      totalCount: transformedExpenses.length,
      dateRange: {
        start: getDateInUserTimezone(rangeStart, userTimezone),
        end: getDateInUserTimezone(rangeEnd, userTimezone)
      },
      userTimezone
    });
  } catch (err) {
    console.error("Get expenses by date range error:", err);
    res.status(500).json({ error: "Failed to fetch expenses by date range" });
  }
};

const getRecurringExpensesDue = async (req, res) => {
  try {
    const userId = req.user._id;
    const { startDate, endDate } = req.query;
    const userTimezone = req.query.timezone || req.headers['x-user-timezone'] || 'UTC';
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: "Start date and end date are required" });
    }

    // Get boundaries for start and end dates in user's timezone
    const { startOfDay: rangeStart } = getDayBoundariesInUserTimezone(startDate, userTimezone);
    const { endOfDay: rangeEnd } = getDayBoundariesInUserTimezone(endDate, userTimezone);

    // Query recurring expenses due within the date range
    const recurringExpenses = await RecurringExpense.find({
      userId,
      isActive: true,
      nextTriggerDate: {
        $gte: rangeStart,
        $lte: rangeEnd
      }
    }).populate('categoryId').sort({ nextTriggerDate: 1 });

    // Transform recurring expenses to include timezone information
    const transformedRecurring = recurringExpenses.map(recurring => ({
      ...recurring.toObject(),
      startDate: getDateInUserTimezone(recurring.startDate, userTimezone),
      endDate: recurring.endDate ? getDateInUserTimezone(recurring.endDate, userTimezone) : null,
      nextTriggerDate: getDateInUserTimezone(recurring.nextTriggerDate, userTimezone),
      userTimezone: recurring.userTimezone || userTimezone
    }));

    const totalDueAmount = transformedRecurring.reduce((sum, r) => sum + r.amount, 0);

    res.status(200).json({
      recurringExpenses: transformedRecurring,
      totalCount: transformedRecurring.length,
      totalDueAmount,
      dateRange: {
        start: getDateInUserTimezone(rangeStart, userTimezone),
        end: getDateInUserTimezone(rangeEnd, userTimezone)
      },
      userTimezone
    });
  } catch (err) {
    console.error("Get recurring expenses due error:", err);
    res.status(500).json({ error: "Failed to fetch recurring expenses due" });
  }
};

export {
  createRecurringExpense,
  getAllRecurringExpenses,
  getSingleRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
  toggleRecurringStatus,
  getSummary,
  getExpensesByDateRange,
  getRecurringExpensesDue,
};