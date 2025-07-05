import { ExpenseTable } from "@/components/expense/ExpenseTable";
import AddExpenseDialog from "@/components/expense/AddExpenseDialog";
import { NavigationBar } from "@/components/common/Navigationbar";

export default function ExpensesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Expenses", isCurrentPage: true },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <NavigationBar items={breadcrumbItems} />

      <main className="flex-1 px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
            <p className="text-muted-foreground">
              Track and manage your expenses
            </p>
          </div>

          {/* Expense Table */}
          <ExpenseTable />
        </div>
      </main>

      {/* Add Expense Dialog */}
      <AddExpenseDialog />
    </div>
  );
}
