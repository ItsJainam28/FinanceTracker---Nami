import { ScheduledExpense } from "@/api/scheduledExpense";
import { format } from "date-fns";
import { PencilIcon, PauseIcon, PlayIcon, Trash2Icon } from "lucide-react";


interface Props {
  expense: ScheduledExpense;
  onEdit: () => void;
  onDelete?: () => void;
  onToggle?: () => void;
}

export default function RecurringExpenseCard({ expense, onEdit, onDelete, onToggle}: Props) {
  return (
    <div
  className={`rounded-2xl p-5 transition-all border ${
    expense.isActive
      ? "bg-zinc-900 border-emerald-500/30 shadow-lg ring-1 ring-emerald-400/40 hover:ring-emerald-500/70"
      : "bg-zinc-900 border-zinc-800 shadow-md hover:shadow-lg"
  }`}
>

      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 mt-1" />
          <h2 className="text-lg font-semibold">{expense.name}</h2>
        </div>
        <span className="text-md font-bold">${expense.amount.toFixed(2)}</span>
      </div>

      <div className="mt-2 text-sm text-muted-foreground">
        Monthly • Next: {format(new Date(expense.nextTriggerDate), "MMM d")}
      </div>

      <div className="mt-2 text-sm text-zinc-400 italic">
        Status:{" "}
        {expense.isActive ? (
          <span className="text-emerald-400">Active</span>
        ) : (
          <span className="text-red-400">Paused</span>
        )}
      </div>
      <div className="flex gap-2 mt-4">
  <button
    onClick={onEdit}
    className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
    title="Edit"
  >
    <PencilIcon size={16} className="text-zinc-300 hover:text-white" />
  </button>

  <button
    onClick={onDelete}
    className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
    title="Delete"
  >
    <Trash2Icon size={16} className="text-zinc-300 hover:text-red-500" />
  </button>

  <button
    onClick={onToggle}
    className="p-2 rounded-md hover:bg-zinc-800 transition-colors"
    title={expense.isActive ? "Pause" : "Resume"}
  >
    {expense.isActive ? (
      <PauseIcon size={16} className="text-zinc-300 hover:text-white" />
    ) : (
      <PlayIcon size={16} className="text-zinc-300 hover:text-white" />
    )}
  </button>
</div>

    </div>
  );
}
