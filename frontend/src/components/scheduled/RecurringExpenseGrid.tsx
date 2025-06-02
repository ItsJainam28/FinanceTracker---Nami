import { useEffect, useState } from "react";
import {
  getScheduledExpenses,
  updateScheduledExpense,
  deleteScheduledExpense,
  toggleScheduledExpense,
  getUserTimezone,
  getDateStringForInput,
  ScheduledExpense,
} from "@/api/scheduledExpense";

import RecurringExpenseCard from "./RecurringExpenseCard";
import EditScheduledExpenseModal from "./EditScheduledExpenseModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { toast } from "sonner";

export default function RecurringExpenseGrid() {
  const [expenses, setExpenses] = useState<ScheduledExpense[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<null | ScheduledExpense>(null);
  const [toDelete, setToDelete] = useState<null | ScheduledExpense>(null);
  
  const userTimezone = getUserTimezone(); // Get user's timezone

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const res = await getScheduledExpenses(userTimezone, "active");
        console.log("Fetched scheduled expenses:", res.data);
        setExpenses(res.data);
      } catch (err) {
        console.error("Failed to load scheduled expenses:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [userTimezone]);

  const handleSave = async (updated: {
    name: string;
    amount: number;
    endDate?: string | null;
    isActive: boolean;
  }) => {
    if (!editing) return;

    try {
      const res = await updateScheduledExpense(userTimezone, editing._id, updated);
      setExpenses((prev) =>
        prev.map((e) => (e._id === editing._id ? res.data : e))
      );
      setEditing(null);
    } catch (err) {
      console.error("Failed to update scheduled expense", err);
      toast.error("Failed to update scheduled expense");
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await deleteScheduledExpense(toDelete._id);
      setExpenses((prev) => prev.filter((e) => e._id !== toDelete._id));
      toast.success("Scheduled expense deleted");
      setToDelete(null);
    } catch (err) {
      console.error("Delete failed", err);
      toast.error("Failed to delete scheduled expense");
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
      toast.success(res.data.isActive ? "Resumed" : "Paused");
    } catch (err) {
      console.error("Toggle failed", err);
      toast.error("Failed to toggle status");
    }
  };

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">
        Loading scheduled expenses...
      </p>
    );
  }

  if (!expenses.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No active scheduled expenses found.
      </p>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {expenses.map((expense) => (
          <RecurringExpenseCard
            key={expense._id}
            expense={expense}
            onEdit={() => setEditing(expense)}
            onDelete={() => setToDelete(expense)}
            onToggle={() => handleToggle(expense._id)}
          />
        ))}
      </div>

      {editing && (
        <EditScheduledExpenseModal
          open={!!editing}
          onClose={() => setEditing(null)}
          initial={{
            name: editing.name,
            amount: editing.amount,
            endDate: editing.endDate ? getDateStringForInput(editing.endDate) : null,
            isActive: editing.isActive,
          }}
          onSave={handleSave}
        />
      )}

      {toDelete && (
        <ConfirmDialog
          open={true}
          onClose={() => setToDelete(null)}
          title="Delete Scheduled Expense"
          description="Are you sure you want to delete this recurring expense? This action cannot be undone."
          onConfirm={confirmDelete}
        />
      )}
    </>
  );
}