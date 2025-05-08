// src/components/budget/EditBudgetModal.tsx
import { useState, useEffect } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

interface Props {
  open: boolean;
  onClose: () => void;
  initial: {
    month: number;
    year: number;
    amount: number;
    categories: string[];
    isRecurring: boolean;
  };
  categories: { _id: string; name: string }[];
  onSave: (data: {
    month: number;
    year: number;
    amount: number;
    categories: string[];
    isRecurring: boolean;
  }) => Promise<void>;
}

export default function EditBudgetModal({
  open,
  onClose,
  initial,
  categories,
  onSave,
}: Props) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial);
  }, [initial]);

  if (!open) return null;

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    if (name === "amount") {
      setForm((p) => ({ ...p, amount: Number(value) }));
    } else if (name === "isRecurring") {
      setForm((p) => ({ ...p, isRecurring: checked }));
    } else {
      setForm((p) => ({ ...p, [name]: Number(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/40 bg-opacity-20 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-black text-white p-6 rounded-md shadow-xl w-full max-w-md space-y-4 border border-white/20"
      >
        <h2 className="text-xl font-bold">Edit Budget</h2>

        {/* Month & Year Select */}
        <div className="flex gap-2">
          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="flex-1 bg-black border border-white/20 text-white p-2 rounded"
          >
            {Array.from({ length: 12 }).map((_, i) => (
              <option key={i + 1} value={i + 1} className="text-gray-500">
                {new Date(0, i).toLocaleString("default", { month: "short" })}
              </option>
            ))}
          </select>
          <select
            name="year"
            value={form.year}
            onChange={handleChange}
            className="flex-1 bg-black border border-white/20 text-white p-2 rounded"
          >
            {Array.from({ length: 5 }).map((_, i) => {
              const y = new Date().getFullYear() - (4 - i);
              return (
                <option key={y} value={y} className="text-gray-500">
                  {y}
                </option>
              );
            })}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="text-sm font-medium block mb-1">Amount ($)</label>
          <Input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            className="bg-black border border-white/20 text-white"
          />
        </div>

        {/* Categories Multi-Select */}
        <div>
          <label className="text-sm font-medium block mb-1">Categories</label>
          <Popover.Root>
            <Popover.Trigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between border-white/20 bg-black text-white"
                type="button"
              >
                {form.categories.length
                  ? form.categories
                      .map((id) => categories.find((c) => c._id === id)?.name)
                      .join(", ")
                  : "Select categories…"}
              </Button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="bg-black text-white border border-white/20 rounded-md shadow-md p-4 w-88 z-50"
                sideOffset={5}
              >
                <div className="space-y-2 max-h-48 overflow-auto">
                  {categories.map((cat) => (
                    <label
                      key={cat._id}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Checkbox
                        checked={form.categories.includes(cat._id)}
                        onCheckedChange={() => toggleCategory(cat._id)}
                      />
                      {cat.name}
                    </label>
                  ))}
                </div>
                <div className="text-right mt-2">
                  <Popover.Close asChild>
                    <Button
                      variant="secondary"
                      size="sm"
                      className="bg-white text-black"
                    >
                      Done
                    </Button>
                  </Popover.Close>
                </div>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Recurring Toggle */}
        <label className="flex items-center gap-2">
          <Checkbox
            name="isRecurring"
            checked={form.isRecurring}
            onCheckedChange={(c) =>
              setForm((p) => ({ ...p, isRecurring: !!c }))
            }
          />
          Repeat every month
        </label>

        {/* Actions */}
        <div className="flex justify-end gap-2 mt-4">
          <Button
            variant="secondary"
            type="button"
            onClick={onClose}
            className="bg-white text-black"
          >
            Cancel
          </Button>
          <Button type="submit" className="bg-white text-black">
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}
