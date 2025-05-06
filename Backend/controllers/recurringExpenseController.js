const RecurringExpense = require('../models/recurringExpense.js');

const createRecurringExpense = async (req, res) => {
  try {
    const { name, amount, categoryId, startDate, endDate } = req.body;
    const recurring = new RecurringExpense({
      userId: req.user._id,
      name,
      amount,
      categoryId: categoryId || null,
      budgetId: null,
      startDate,
      endDate: endDate || null,
      nextTriggerDate: new Date(startDate),
    });
    await recurring.save();
    res.status(201).json(recurring);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getAllRecurringExpenses = async (req, res) => {
  try {
    const data = await RecurringExpense.find({ userId: req.user._id });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSingleRecurringExpense = async (req, res) => {
  try {
    const item = await RecurringExpense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!item) return res.status(404).json({ error: "Not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateRecurringExpense = async (req, res) => {
  try {
    const updated = await RecurringExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Not found" });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
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
    res.status(500).json({ error: err.message });
  }
};

module.exports = {
  createRecurringExpense,
  getAllRecurringExpenses,
  getSingleRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
};