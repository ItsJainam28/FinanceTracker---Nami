import AddExpenseForm from "@/components/expense/AddExpenseForm";
import React from "react";

export function AddExpensePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto py-4 px-4">
        <AddExpenseForm />
      </div>
    </div>
  );
}
