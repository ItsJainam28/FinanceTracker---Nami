import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Category {
    _id: string;
    name: string;
}

interface Budget {
    _id: string;
    name: string;
}

interface Props{
    open: boolean;
    onClose: () => void;
    onSave: (updated: { name: string; amount: number; date: string; categoryId?: string; budgetId?: string }) => void;
    initial: {
        name: string;
        amount: number;
        date: string;
        categoryId?: string;
        budgetId?: string;
    };
    categories: Category[];
    budgets: Budget[];
}

export default function EditExpenseModal({open, onClose, onSave, initial, categories, budgets}: Props) {
    const [form, setForm] = useState(initial);

    useEffect(
        () => {
            setForm(initial); // reset when expense changes
        }
    , [initial]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === "checkbox") {
            const checked = (e.target as HTMLInputElement).checked;
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleSubmit = () => {
        onSave({
          ...form,
          amount: Number(form.amount),
        });
        onClose();
      };
    
      return (
        <Dialog.Root open={open} onOpenChange={onClose}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-lg space-y-4">
              <Dialog.Title className="text-xl font-bold">Edit Expense</Dialog.Title>
    
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Expense Name"
              />
    
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="Amount"
              />
    
              <Input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
              />
    
              <select
                name="categoryId"
                value={form.categoryId || ""}
                onChange={handleChange}
                className="border rounded p-2 text-sm w-full"
              >
                <option value="">Select Category (optional)</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
    
              <select
                name="budgetId"
                value={form.budgetId || ""}
                onChange={handleChange}
                className="border rounded p-2 text-sm w-full"
              >
                <option value="">Select Budget (optional)</option>
                {budgets.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
    
              <div className="flex justify-end gap-4 pt-4">
                <Button variant="secondary" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSubmit}>Save</Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      );
}