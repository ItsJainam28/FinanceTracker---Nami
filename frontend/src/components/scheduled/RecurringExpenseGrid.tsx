import { useState } from "react";
import { ScheduledExpense, getDateStringForInput } from "@/api/scheduledExpense";
import RecurringExpenseCard from "./RecurringExpenseCard";
import EditScheduledExpenseModal from "./EditScheduledExpenseModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface RecurringExpenseGridProps {
  expenses: ScheduledExpense[];
  loading: boolean;
  onUpdate: (id: string, data: {
    name: string;
    amount: number;
    endDate?: string | null;
    isActive: boolean;
  }) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onToggle: (id: string) => Promise<void>;
}

export default function RecurringExpenseGrid({ 
  expenses, 
  loading, 
  onUpdate, 
  onDelete, 
  onToggle 
}: RecurringExpenseGridProps) {
  const [editing, setEditing] = useState<null | ScheduledExpense>(null);
  const [toDelete, setToDelete] = useState<null | ScheduledExpense>(null);

  const handleSave = async (updated: {
    name: string;
    amount: number;
    endDate?: string | null;
    isActive: boolean;
  }) => {
    if (!editing) return;

    try {
      await onUpdate(editing._id, updated);
      setEditing(null);
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await onDelete(toDelete._id);
      setToDelete(null);
    } catch (err) {
   
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await onToggle(id);
    } catch (err) {
      // Error handling is done in the parent component
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-2xl p-5 bg-background border border-border animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
              <div className="h-6 bg-muted rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
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