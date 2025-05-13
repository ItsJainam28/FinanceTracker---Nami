import AppSidebar from "@/components/common/AppSidebar";
import { ExpenseTable } from "@/components/expense/ExpenseTable";

export default function ExpensesPage() {
 return(
    <div className="flex-1 min-h-screen bg-black text-white px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold">Transactions</h1>
          <ExpenseTable
          />
        </div>
      </div>
 )
}
