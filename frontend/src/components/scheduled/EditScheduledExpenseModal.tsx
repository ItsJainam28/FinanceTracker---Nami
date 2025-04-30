import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ScheduledExpenseForm {
  name: string;
  amount: number;
  startDate: string;
  endDate?: string;
  categoryId?: string;
  budgetId?: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
}
interface Budget {
  _id: string;
  name: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: ScheduledExpenseForm;
  categories: Category[];
  budgets: Budget[];
  onSave: (updated: ScheduledExpenseForm) => Promise<void>;
}

export default function EditScheduledExpenseModal({
  open,
  onClose,
  initial,
  categories,
  budgets,
  onSave,
}: Props) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  if (!open) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-md shadow-xl w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold mb-2">Edit Scheduled Expense</h2>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Expense Name</label>
          <Input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Expense Name"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Amount ($)</label>
          <Input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Start Date</label>
          <Input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">End Date (optional)</label>
          <Input
            type="date"
            name="endDate"
            value={form.endDate || ""}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Category</label>
          <select
            name="categoryId"
            value={form.categoryId || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-sm"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium block">Assign to Budget</label>
          <select
            name="budgetId"
            value={form.budgetId || ""}
            onChange={handleChange}
            className="w-full border border-gray-300 p-2 rounded text-sm"
          >
            <option value="">No Budget</option>
            {budgets.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-sm mt-2">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Enable Auto-Payment
        </label>

        <div className="flex justify-end gap-2 mt-4">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
