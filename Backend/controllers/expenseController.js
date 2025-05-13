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
    // 1. Parse pagination
    const page  = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, parseInt(req.query.limit, 10) || 25);

    // 2. Build filter object
    const filter = { userId: req.user.id };

    if (req.query.search) {
      filter.name = { $regex: req.query.search, $options: 'i' };
    }
    if (req.query.dateFrom || req.query.dateTo) {
      filter.date = {};
      if (req.query.dateFrom) filter.date.$gte = new Date(req.query.dateFrom);
      if (req.query.dateTo)   filter.date.$lte = new Date(req.query.dateTo);
    }
    if (req.query.categoryIds) {
      const ids = req.query.categoryIds.split(',');
      filter.categoryId = { $in: ids };
    }
    if (req.query.amountMin || req.query.amountMax) {
      filter.amount = {};
      if (req.query.amountMin) filter.amount.$gte = parseFloat(req.query.amountMin);
      if (req.query.amountMax) filter.amount.$lte = parseFloat(req.query.amountMax);
    }
    if (req.query.recurring != null) {
      filter.isRecurring = req.query.recurring === 'true';
    }

    // 3. Determine sort
    const sortableFields = ['date','amount','name','categoryId','isRecurring'];
    let sortBy    = sortableFields.includes(req.query.sortBy) ? req.query.sortBy : 'date';
    let sortOrder = req.query.sortOrder === 'asc' ? 1 : -1;

    // 4. Count total matching documents
    const total = await Expense.countDocuments(filter);

    // 5. Fetch paginated results
    const data = await Expense.find(filter)
      .sort({ [sortBy]: sortOrder })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    // 6. Return payload
    return res.json({
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('getExpenses error:', err);
    return res.status(500).json({ message: 'Server error' });
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
    console.log('updateExpense body:', req.body);
    const updates = {};
    const allowed = ['name','amount','date','categoryId','isRecurring'];
    allowed.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });
    if (updates.date) updates.date = new Date(updates.date);

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { $set: updates },
      { new: true }
    ).lean();

    if (!expense) return res.status(404).json({ message: 'Expense not found' });
    return res.json(expense);
  } catch (err) {
    console.error('updateExpense error:', err);
    return res.status(500).json({ message: 'Server error' });
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

const bulkDeleteExpenses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No IDs provided' });
    }
    await Expense.deleteMany({ _id: { $in: ids }, userId: req.user.id });
    return res.sendStatus(204);
  } catch (err) {
    console.error('bulkDeleteExpenses error:', err);
    return res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  bulkDeleteExpenses
};
