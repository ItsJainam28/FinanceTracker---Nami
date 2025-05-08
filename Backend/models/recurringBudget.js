const mongoose = require("mongoose");

const recurringBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    amount: {
      type: Number,
      required: true,
    },
    startMonth: {
      type: Number, // 1 = Jan, 12 = Dec
      required: true,
    },
    startYear: {
      type: Number,
      required: true,
    },
    endMonth: {
      type: Number, // optional
    },
    endYear: {
      type: Number,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Enforce unique category set per user (only one active recurringBudget per category set)
recurringBudgetSchema.index(
  { userId: 1, categories: 1, isActive: 1 },
  { unique: true, partialFilterExpression: { isActive: true } }
);

module.exports = mongoose.model("RecurringBudget", recurringBudgetSchema);
