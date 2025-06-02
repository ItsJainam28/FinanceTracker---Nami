import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  getScheduledExpenses,
  getScheduledSummary,
  updateScheduledExpense,
  deleteScheduledExpense,
  toggleScheduledExpense,
  getUserTimezone,
  ScheduledExpense,
  ScheduledSummary,
} from "@/api/scheduledExpense";
import SummaryTiles from "@/components/scheduled/SummaryTiles";
import RecurringExpenseGrid from "@/components/scheduled/RecurringExpenseGrid";
import AddScheduledExpenseForm from "@/components/scheduled/AddScheduleExpenseForm";
import { NavigationBar } from "@/components/common/Navigationbar";

export default function ScheduledExpensesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [expenses, setExpenses] = useState<ScheduledExpense[]>([]);
  const [summary, setSummary] = useState<ScheduledSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const userTimezone = getUserTimezone();
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Scheduled Expenses", isCurrentPage: true },
  ];

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, summaryRes] = await Promise.all([
        getScheduledExpenses(userTimezone, "active"),
        getScheduledSummary(userTimezone),
      ]);

      setExpenses(expensesRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
      toast.error("Failed to load scheduled expenses");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [userTimezone]);

  const handleSuccessfulAdd = () => {
    setDialogOpen(false);
    fetchData(); // Refetch data after adding
  };

  const handleUpdate = async (
    id: string,
    updated: {
      name: string;
      amount: number;
      endDate?: string | null;
      isActive: boolean;
    }
  ) => {
    try {
      const res = await updateScheduledExpense(userTimezone, id, updated);
      setExpenses((prev) => prev.map((e) => (e._id === id ? res.data : e)));
      // Refetch summary to update totals
      const summaryRes = await getScheduledSummary(userTimezone);
      setSummary(summaryRes.data);
      toast.success("Scheduled expense updated");
    } catch (err) {
      console.error("Failed to update scheduled expense", err);
      toast.error("Failed to update scheduled expense");
      throw err;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteScheduledExpense(id);
      setExpenses((prev) => prev.filter((e) => e._id !== id));
      // Refetch summary to update totals
      const summaryRes = await getScheduledSummary(userTimezone);
      setSummary(summaryRes.data);
      toast.success("Scheduled expense deleted");
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete scheduled expense");
      throw err;
    }
  };

  const handleToggle = async (id: string) => {
    try {
      const res = await toggleScheduledExpense(id);
      setExpenses((prev) =>
        prev.map((e) =>
          e._id === id ? { ...e, isActive: res.data.isActive } : e
        )
      );
      // Refetch summary to update totals
      const summaryRes = await getScheduledSummary(userTimezone);
      setSummary(summaryRes.data);
      toast.success(res.data.isActive ? "Resumed" : "Paused");
    } catch (err) {
      console.error("Toggle failed", err);
      toast.error("Failed to toggle status");
      throw err;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <NavigationBar items={breadcrumbItems} />

      <div className="flex-1 min-h-screen bg-background text-foreground px-6 py-10">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* ─── Header (no “Add” button here anymore) ───────────────────────── */}
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-extrabold">
              Scheduled Expenses
            </h1>
            {/* Removed DialogTrigger from here */}
          </div>

          {/* ─── Summary Tiles & Grid ──────────────────────────────────────── */}
          <SummaryTiles summary={summary} loading={loading} />
          <RecurringExpenseGrid
            expenses={expenses}
            loading={loading}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onToggle={handleToggle}
          />
        </div>
      </div>

      {/* ─── Floating “Add Scheduled Expense” Button ───────────────────── */}
      <div className="fixed bottom-6 right-6 z-50">
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg">
              <Plus className="w-4 h-4 mr-2" />
              Add Scheduled Expense
            </Button>
          </DialogTrigger>

          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                Add Scheduled Expense
              </DialogTitle>
              <DialogDescription className="text-muted-foreground">
                Create a new recurring expense that will be automatically tracked.
              </DialogDescription>
            </DialogHeader>

            <AddScheduledExpenseForm onSuccess={handleSuccessfulAdd} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
