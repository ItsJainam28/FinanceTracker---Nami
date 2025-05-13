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
    amount: number;
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <form
        onSubmit={submit}
        className="bg-black text-white border border-white rounded-xl shadow-2xl p-6 w-full max-w-md space-y-5"
      >
        <h2 className="text-2xl font-semibold text-white">Edit Expense</h2>
        <Input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="bg-black text-white border-white placeholder:text-gray-400"
        />
        <Input
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
          className="bg-black text-white border-white placeholder:text-gray-400"
        />
        <Input
          type="date"
          name="date"
          value={form.date} 
          onChange={handleChange}
          required
          className="bg-black text-white border-white"
        />
        <Select
          value={form.categoryId}
          onValueChange={(val) => setForm((p) => ({ ...p, categoryId: val }))}
        >
          <SelectTrigger className="bg-black text-white border border-white">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent className="bg-black text-white border border-white">
            {categories.map((c) => (
              <SelectItem key={c._id} value={c._id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="ghost"
            type="button"
            onClick={onClose}
            className="border border-white text-white hover:bg-white hover:text-black"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="bg-white text-black hover:bg-gray-200"
          >
            Save
          </Button>
        </div>
      </form>
    </div>
  );
}