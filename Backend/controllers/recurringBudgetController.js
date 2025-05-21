const RecurringBudget = require("../models/recurringBudget");
const Budget = require("../models/budget");

// 1. Create a new recurring budget
const createRecurringBudget = async (req, res) => {
  try {
    const { name, categories, amount, endMonth, endYear } = req.body;
    console.log("Request Body:", req.body);
    const userId = req.user._id;

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    // Prevent end date in the past
    if (endMonth && endYear) {
      if (
        endYear < currentYear ||
        (endYear === currentYear && endMonth < currentMonth)
      ) {
        return res
          .status(400)
          .json({ error: "End date cannot be in the past." });
      }
    }

    // Prevent duplicate category set
    const allActive = await RecurringBudget.find({ userId, isActive: true });

    const isDuplicate = allActive.some((r) => {
      const rSet = new Set(r.categories.map(String));
      const newSet = new Set(categories.map(String));
      if (rSet.size !== newSet.size) return false;
      for (let cat of newSet) {
        if (!rSet.has(cat)) return false;
      }
      return true;
    });

    if (isDuplicate) {
      return res
        .status(400)
        .json({ error: "A budget for these categories already exists." });
    }

    
    // Create recurring budget
    const recurring = new RecurringBudget({
      userId,
      name,
      categories,
      amount,
      startMonth: currentMonth,
      startYear: currentYear,
      endMonth: endMonth || null,
      endYear: endYear || null,
    });
    await recurring.save();

    // Also create current month budget
    const budget = new Budget({
      userId,
      recurringBudgetId: recurring._id,
      month: currentMonth,
      year: currentYear,
      amount,
      categories,
      isArchived: false,
    });
    await budget.save();

    res.status(201).json({ recurring, budget });
  } catch (err) {
    console.error("Create Recurring Budget Error:", err);
    res.status(500).json({ error: "Failed to create recurring budget." });
  }
};

// 2. Deactivate a recurring budget
const deactivateRecurringBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    const recurring = await RecurringBudget.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false },
      { new: true }
    );

    if (!recurring) {
      return res.status(404).json({ error: "Recurring budget not found." });
    }

    const now = new Date();
    const thisMonth = now.getMonth() + 1;
    const thisYear = now.getFullYear();

    await Budget.updateMany(
      {
        recurringBudgetId: recurring._id,
        $or: [
          { year: { $gt: thisYear } },
          { year: thisYear, month: { $gt: thisMonth } },
        ],
      },
      { isArchived: true }
    );

    res.json({
      message: "Recurring budget deactivated and future budgets archived.",
    });
  } catch (err) {
    console.error("Deactivate Recurring Budget Error:", err);
    res.status(500).json({ error: "Failed to deactivate budget." });
  }
};

// 3. Update end date
const updateRecurringBudgetEndDate = async (req, res) => {
  try {
    const { id } = req.params;
    const { endMonth, endYear } = req.body;
    const userId = req.user._id;

    if (!endMonth || !endYear) {
      return res
        .status(400)
        .json({ error: "End month and year are required." });
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (
      endYear < currentYear ||
      (endYear === currentYear && endMonth < currentMonth)
    ) {
      return res.status(400).json({ error: "End date cannot be in the past." });
    }

    const updated = await RecurringBudget.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { endMonth, endYear },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ error: "Recurring budget not found." });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update End Date Error:", err);
    res.status(500).json({ error: "Failed to update end date." });
  }
};

const updateRecurringBudget = async (req, res) => {
  try {
    const { name, amount, categories } = req.body;
    const { id } = req.params;
    const userId = req.user._id;

    const recurring = await RecurringBudget.findOne({ _id: id, userId });
    if (!recurring) return res.status(404).json({ error: "Budget not found" });

    // Update recurring budget fields
    recurring.name = name;
    recurring.amount = amount;
    recurring.categories = categories;
    await recurring.save();

    // Update the current month's budget (if it exists)
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    await Budget.updateOne(
      {
        recurringBudgetId: id,
        month: currentMonth,
        year: currentYear,
      },
      {
        $set: {
          amount,
          categories,
        },
      }
    );

    res.json({ message: "Recurring budget updated successfully" });
  } catch (err) {
    console.error("Error updating recurring budget:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
};

// 4. Get active recurring budgets
const getActiveRecurringBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const budgets = await RecurringBudget.find({
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

    res.json(budgets);
  } catch (err) {
    console.error("Fetch Active Budgets Error:", err);
    res.status(500).json({ error: "Failed to fetch active budgets." });
  }
};

// 5. Get archived recurring budgets
const getArchivedRecurringBudgets = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const archived = await RecurringBudget.find({
      userId,
      $or: [
        { isActive: false },
        {
          endYear: { $lt: currentYear },
        },
        {
          endYear: currentYear,
          endMonth: { $lt: currentMonth },
        },
      ],
    }).sort({ createdAt: -1 });

    res.json(archived);
  } catch (err) {
    console.error("Fetch Archived Budgets Error:", err);
    res.status(500).json({ error: "Failed to fetch archived budgets." });
  }
};

//Maake a route to get calculated current month budgets expense of all Recurring Budget

module.exports = {
  createRecurringBudget,
  deactivateRecurringBudget,
  updateRecurringBudgetEndDate,
  getActiveRecurringBudgets,
  getArchivedRecurringBudgets,
  updateRecurringBudget,
};
