import RecurringExpense from "../models/recurringExpense.js";
import Expense from "../models/expense.js";

const createRecurringExpense = async (req, res) => {
  try {
    const { name, amount, categoryId, startDate, endDate, logIfPast } = req.body;
    const userId = req.user._id;

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurring = new RecurringExpense({
      userId,
      name,
      amount,
      categoryId: categoryId || null,
      budgetId: null,
      startDate: start,
      endDate: endDate || null,
      nextTriggerDate: new Date(start),
    });

    await recurring.save();

    const isPastInCurrentMonth =
      start < today &&
      start.getMonth() === today.getMonth() &&
      start.getFullYear() === today.getFullYear();

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

      const next = new Date(start);
      next.setMonth(next.getMonth() + 1);
      recurring.nextTriggerDate = next;
      await recurring.save();
    }

    res.status(201).json(recurring);
  } catch (err) {
    console.error("Create recurring error:", err);
    res.status(500).json({ error: "Failed to create recurring expense" });
  }
};

const getAllRecurringExpenses = async (req, res) => {
  try {
    const data = await RecurringExpense.find({ userId: req.user._id });
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch recurring expenses" });
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
    res.status(500).json({ error: "Failed to fetch recurring expense" });
  }
};

const updateRecurringExpense = async (req, res) => {
  try {
    const allowedFields = ["name", "amount", "endDate", "isActive"];
    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const updated = await RecurringExpense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!updated) return res.status(404).json({ error: "Not found" });

    res.status(200).json(updated);
  } catch (err) {
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
    res.status(500).json({ error: "Failed to toggle recurring status" });
  }
};

const getSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const recurringExpenses = await RecurringExpense.find({
      userId,
      isActive: true,
      startDate: { $lte: today },
      $or: [
        { endDate: null },
        { endDate: { $gte: today } }
      ],
    });

    const totalMonthlySpend = recurringExpenses.reduce((sum, r) => sum + r.amount, 0);

    const sorted = [...recurringExpenses].sort(
      (a, b) => new Date(a.nextTriggerDate) - new Date(b.nextTriggerDate)
    );

    const next = sorted[0];

    const weekFromNow = new Date(today);
    weekFromNow.setDate(today.getDate() + 7);

    const upcomingList = sorted.filter(
      (r) => r.nextTriggerDate >= today && r.nextTriggerDate <= weekFromNow
    );

    res.status(200).json({
      totalMonthlySpend,
      nextPaymentName: next?.name || null,
      nextPaymentDate: next ? next.nextTriggerDate : null,
      upcomingCount: upcomingList.length,
      upcomingList: upcomingList.map((r) => ({
        _id: r._id,
        name: r.name,
        nextTriggerDate: r.nextTriggerDate,
      })),
    }); 
  } catch (err) {
    console.error("Summary error:", err);
    res.status(500).json({ error: "Failed to fetch summary" });
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
};
