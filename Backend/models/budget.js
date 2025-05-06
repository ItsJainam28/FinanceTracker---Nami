const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    month: {
      type: Number, // 0 = Jan, 11 = Dec
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
    isRecurring: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

budgetSchema.index({ userId: 1, month: 1, year: 1 }); // Optimize querying by time

module.exports = mongoose.model("Budget", budgetSchema);
