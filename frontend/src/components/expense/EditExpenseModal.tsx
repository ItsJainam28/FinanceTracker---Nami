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
  initial: { name: string; amount: number; date: string; categoryId: string };
  categories: { _id: string; name: string }[];
  onSave: (data: {
    name: string;
    amount: string | number;
    date: string;
    categoryId: string;
  }) => Promise<void>;
}

export default function EditExpenseModal({
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
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-white rounded-md shadow-xl p-6 w-full max-w-md space-y-4"
      >
        <h2 className="text-xl font-bold">Edit Expense</h2>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
        />
        <Input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        <Input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
        />
        <Select
          value={form.categoryId}
          onValueChange={(val) => setForm((p) => ({ ...p, categoryId: val }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

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
