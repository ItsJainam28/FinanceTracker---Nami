const Expense = require('../models/expense');

// @desc    Create a new expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const { name, amount, date, categoryId, isRecurring } = req.body;

    const expense = await Expense.create({
      userId: req.user._id,
      name,
      amount,
      date: date || Date.now(),
      budgetId: null,
      categoryId: categoryId || null,
      isRecurring: isRecurring || false,
    });

    res.status(201).json(expense);
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: error.message });
  }
};

// @desc    Get all expenses for user
const getExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.user._id }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Get single expense
const getExpenseById = async (req, res) => {
  try {
    const expense = await Expense.findOne({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(200).json(expense);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// @desc    Update an expense
const updateExpense = async (req, res) => {
  try {
    const updates = { ...req.body };
    delete updates.budgetId; // ignore if sent
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );
    if (!expense) return res.status(404).json({ error: "Not found" });
    res.json(expense);
  } catch {
    res.status(500).json({ error: "Failed to update expense" });
  }
};

// @desc    Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }
    res.status(200).json({ message: "Expense deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
