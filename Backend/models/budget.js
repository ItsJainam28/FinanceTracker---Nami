import mongoose from "mongoose";

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recurringBudgetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RecurringBudget",
      required: true,
    },
    month: {
      type: Number,
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Prevent duplicate budget per month for same recurringBudget
budgetSchema.index(
  { recurringBudgetId: 1, month: 1, year: 1 },
  { unique: true }
);

const Budget = mongoose.model("Budget", budgetSchema);
export default Budget;