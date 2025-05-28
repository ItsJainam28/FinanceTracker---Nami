import mongoose from "mongoose";

const recurringExpenseSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  amount: { type: Number, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
  budgetId: { type: mongoose.Schema.Types.ObjectId, ref: "Budget" },
  startDate: { type: Date, required: true },
  endDate: { type: Date, default: null },
  frequency: { type: String, enum: ["monthly"], default: "monthly" },
  nextTriggerDate: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
});

const RecurringExpense = mongoose.model("RecurringExpense", recurringExpenseSchema);
export default RecurringExpense;
