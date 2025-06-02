import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";

interface EditRecurringBudgetModalProps {
  open: boolean;
  onClose: () => void;
  budget: {
    _id: string;
    name: string;
    amount: number;
    categories: string[];
    endMonth: number | null;
    endYear: number | null;
  };
  categories: { _id: string; name: string }[];
  onUpdated: () => void;
}

export default function EditRecurringBudgetModal({
  open,
  onClose,
  budget,
  categories,
  onUpdated,
}: EditRecurringBudgetModalProps) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    categories: [] as string[],
    endMonth: null as number | null,
    endYear: null as number | null,
  });

  useEffect(() => {
    if (budget) {
      setForm({
        name: budget.name,
        amount: budget.amount.toString(),
        categories: budget.categories,
        endMonth: budget.endMonth,
        endYear: budget.endYear,
      });
    }
  }, [budget]);

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter((c) => c !== id)
        : [...prev.categories, id],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.patch(`/recurring-budgets/${budget._id}`, {
        name: form.name,
        amount: Number(form.amount),
        categories: form.categories,
        endMonth: form.endMonth,
        endYear: form.endYear,
      });
      onClose();
      onUpdated(); // trigger refetch in parent
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to update budget");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background text-foreground border border-border">
        <DialogHeader>
          <DialogTitle>Edit Budget</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <Input
            type="text"
            placeholder="Budget Name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="bg-muted border border-border text-foreground"
            required
          />

          <Input
            type="number"
            placeholder="Budget Amount"
            value={form.amount}
            onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
            className="bg-muted border border-border text-foreground"
            required
          />

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Categories</label>
            <div className="grid grid-cols-2 gap-2">
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
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">End Month (optional)</label>
            <div className="flex gap-2">
              <select
                value={form.endMonth || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endMonth: Number(e.target.value) || null,
                  }))
                }
                className="bg-muted border border-border p-2 rounded text-foreground"
              >
                <option value="">Month</option>
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>

              <select
                value={form.endYear || ""}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    endYear: Number(e.target.value) || null,
                  }))
                }
                className="bg-muted border border-border p-2 rounded text-foreground"
              >
                <option value="">Year</option>
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() + i;
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <Button type="submit" className="w-full mt-2">
            Update Budget
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
