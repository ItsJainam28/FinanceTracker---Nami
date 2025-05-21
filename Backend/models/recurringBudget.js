const mongoose = require("mongoose");

const recurringBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name:{
      type: String,
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



module.exports = mongoose.model("RecurringBudget", recurringBudgetSchema);
