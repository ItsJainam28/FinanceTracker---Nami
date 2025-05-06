import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onClose: () => void;
  initial: {
    name: string;
    amount: number;
    startDate: string;
    endDate?: string;
    categoryId: string;
    isActive: boolean;
  };
  categories: { _id: string; name: string }[];
  onSave: (data: any) => Promise<void>;
}

export default function EditScheduledExpenseModal({
  open,
  onClose,
  initial,
  categories,
  onSave,
}: Props) {
  const [form, setForm] = useState(initial);
  useEffect(() => setForm(initial), [initial]);
  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSave(form);
        }}
        className="bg-white p-6 rounded shadow w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Edit Scheduled Expense</h2>
        <Input name="name" value={form.name} onChange={handleChange} required />
        <Input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          required
        />
        <Input
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
        />
        <Input
          type="date"
          name="endDate"
          value={form.endDate || ""}
          onChange={handleChange}
        />

        {/* Category dropdown */}
        <Select
          value={form.categoryId}
          onValueChange={(val) => setForm((p) => ({ ...p, categoryId: val }))}
        >
          <SelectTrigger className="bg-white border border-gray-300 rounded px-2 py-2">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-white border border-gray-200 shadow-md">
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
          />
          Enable auto‑payment
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Save</Button>
        </div>
      </form>
    </div>
  );
}
