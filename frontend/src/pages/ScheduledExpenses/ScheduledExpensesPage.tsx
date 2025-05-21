import AppSidebar from "@/components/common/AppSidebar";

import SummaryTiles from "@/components/scheduled/SummaryTiles";
import { useState } from "react";
import RecurringExpenseGrid from "@/components/scheduled/RecurringExpenseGrid";


/*──────── Component */
export default function ScheduledExpensesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "paused">("all");
  const mockExpenses = [
    {
      _id: "1",
      name: "Spotify",
      amount: 12.99,
      categoryName: "Entertainment",
      nextTriggerDate: "2025-05-20",
      isActive: true,
    },
    {
      _id: "2",
      name: "Rent",
      amount: 750,
      categoryName: "Housing",
      nextTriggerDate: "2025-06-01",
      isActive: true,
    },
    {
      _id: "3",
      name: "Gym",
      amount: 30,
      categoryName: "Health",
      nextTriggerDate: "2025-06-05",
      isActive: false,
    },
  ];
  return(
    <div className="flex-1 min-h-screen bg-black text-white px-6 py-10">
    <div className="max-w-7xl mx-auto space-y-8">
    <h1 className="text-3xl font-extrabold">Scheduled Expense</h1>
      <SummaryTiles />
    <RecurringExpenseGrid />
    </div>
  </div>
  )
}
