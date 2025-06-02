import { ScheduledExpense, TimezoneAwareDate } from "@/api/scheduledExpense";
import { format, parseISO } from "date-fns";
import { PencilIcon, PauseIcon, PlayIcon, Trash2Icon } from "lucide-react";

interface Props {
  expense: ScheduledExpense;
  onEdit: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export default function RecurringExpenseCard({
  expense,
  onEdit,
  onDelete,
  onToggle,
}: Props) {
  // Helper function to safely format dates
  const formatTriggerDate = (dateField: TimezoneAwareDate | string | null) => {
    if (!dateField) return "—";
  
    try {
      const rawDate =
        typeof dateField === "string"
          ? dateField
          : dateField.userDate || dateField.utc;
  
      return format(parseISO(rawDate), "MMM d");
    } catch (error) {
      console.error("Error formatting trigger date:", error);
      return "—";
    }
  };
  

  return (
    <div
      className={`rounded-2xl p-5 transition-all border w-full ${
        expense.isActive
          ? "bg-background border-border ring-1 ring-primary shadow-lg hover:ring-ring"
          : "bg-background border-border shadow-md hover:shadow-lg"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 sm:gap-6">
        {/* Left Info */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1" />
            <h2 className="text-lg font-semibold text-foreground">{expense.name}</h2>
          </div>
          <div className="text-sm text-muted-foreground">
            Monthly • Next: {formatTriggerDate(expense.nextTriggerDate)}
          </div>
          <div className="text-sm italic text-muted-foreground">
            Status:{" "}
            <span className="text-foreground">
              {expense.isActive ? "Active" : "Paused"}
            </span>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex flex-col sm:items-end gap-3 sm:gap-2">
          <span className="text-lg font-bold text-foreground">
            ${expense.amount.toFixed(2)}
          </span>

          <div className="flex gap-2">
            <button
              onClick={onEdit}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Edit"
            >
              <PencilIcon size={16} className="text-muted-foreground hover:text-foreground" />
            </button>

            <button
              onClick={onDelete}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title="Delete"
            >
              <Trash2Icon size={16} className="text-muted-foreground hover:text-destructive" />
            </button>

            <button
              onClick={onToggle}
              className="p-2 rounded-md hover:bg-accent transition-colors"
              title={expense.isActive ? "Pause" : "Resume"}
            >
              {expense.isActive ? (
                <PauseIcon size={16} className="text-muted-foreground hover:text-foreground" />
              ) : (
                <PlayIcon size={16} className="text-muted-foreground hover:text-foreground" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}