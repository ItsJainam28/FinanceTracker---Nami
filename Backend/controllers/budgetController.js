const Budget = require('../models/budget');

// @desc    Create a new monthly budget
// @route   POST /api/budgets
// @access  Private
const createBudget = async (req, res) => {
  try {
    const { name, amount, month, year, isRecurring } = req.body;

    // Calculate start and end date for selected month
    const startDate = new Date(year, month - 1, 1); // month is 0-indexed in JS
    const endDate = new Date(year, month, 0);        // 0th day of next month = last day of current month

    const budget = await Budget.create({
      userId: req.user._id,
      name,
      amount,
      startDate,
      endDate,
      isActive: true,
      isRecurring: isRecurring || false,
    });

    res.status(201).json(budget);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all budgets for current user
// GET /api/budgets?show=all OR /api/budgets
const getBudgets = async (req, res) => {
  try {
    const showAll = req.query.show === "all";

    const query = {
      userId: req.user._id,
    };

    if (!showAll) {
      const now = new Date();
      query.endDate = { $gte: now }; // only show current or future
    }

    const budgets = await Budget.find(query);
    res.status(200).json(budgets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// @desc    Get single budget by ID
const getBudgetById = async (req, res) => {
  try {
    const budget = await Budget.findOne({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update an existing budget
const updateBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.status(200).json(budget);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Delete a budget
const deleteBudget = async (req, res) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!budget) {
      return res.status(404).json({ error: "Budget not found" });
    }
    res.status(200).json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createBudget,
  getBudgets,
  getBudgetById,
  updateBudget,
  deleteBudget,
};
