import { ExpenseTable } from "@/components/expense/ExpenseTable";
import AddExpenseDialog from "@/components/expense/AddExpenseDialog";
import { NavigationBar } from "@/components/common/Navigationbar";

export default function ExpensesPage() {
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Expenses", isCurrentPage: true },
  ];
  return (
    <div className="min-h-screen bg-background text-foreground">
      <NavigationBar items={breadcrumbItems} />

      {/* Container with proper spacing like your dashboard */}
      <div className="max-w-7xl mx-auto px-4 ">

        <div className="space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Transactions</h1>
            <p className="text-muted-foreground">
              Track and manage your expenses
            </p>
          </div>

          {/* Main Content */}
          <ExpenseTable />

          {/* Add Expense Dialog */}
          <AddExpenseDialog />
        </div>
      </div>
    </div>
  );
}
