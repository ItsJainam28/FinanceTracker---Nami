import * as Dialog from "@radix-ui/react-dialog";
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (updated: { name: string; amount: number; month: number; isRecurring: boolean }) => void;
  initial: {
    name: string;
    amount: number;
    month: number;
    isRecurring: boolean;
  };
}

export default function EditBudgetModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    setForm(initial); // reset when budget changes
  }, [initial]);

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
      month: Number(form.month),
    });
    onClose();
  };

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[90%] max-w-md -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl p-6 shadow-lg space-y-4">
          <Dialog.Title className="text-xl font-bold">Edit Budget</Dialog.Title>

          <Input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Budget Name"
          />

          <Input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            placeholder="Amount"
          />

          <select
            name="month"
            value={form.month}
            onChange={handleChange}
            className="border rounded p-2 text-sm w-full"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
            />
            Repeat every month
          </label>

          <div className="flex justify-end gap-4 pt-4">
            <Button variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSubmit}>Save</Button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
