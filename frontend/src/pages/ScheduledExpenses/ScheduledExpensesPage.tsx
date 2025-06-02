import SummaryTiles from "@/components/scheduled/SummaryTiles";
import RecurringExpenseGrid from "@/components/scheduled/RecurringExpenseGrid";


/*──────── Component */
export default function ScheduledExpensesPage() {

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
