import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import BudgetStatsModal from "@/components/budget/BudgetStatsModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface RecurringBudget {
  _id: string;
  categories: string[];
  amount: number;
  startMonth: number;
  startYear: number;
  endMonth: number | null;
  endYear: number | null;
  isActive: boolean;
  currentMonth?: {
    spent: number;
    percent: number;
  };
}

interface Category {
  _id: string;
  name: string;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<RecurringBudget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formOpen, setFormOpen] = useState(false);
  const [selected, setSelected] = useState<RecurringBudget | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeactivateId, setPendingDeactivateId] = useState<string | null>(null);


  const [form, setForm] = useState({
    amount: "",
    categories: [] as string[],
    endMonth: null as number | null,
    endYear: null as number | null,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [recurringRes, catRes] = await Promise.all([
        api.get("/budgets/with-usage"),
        api.get("/categories"),
      ]);
      setBudgets(recurringRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

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
      await api.post("/recurring-budgets", {
        amount: Number(form.amount),
        categories: form.categories,
        startDate: new Date(),
        endMonth: form.endMonth || null,
        endYear: form.endYear || null,
      });
      setFormOpen(false);
      setForm({ amount: "", categories: [], endMonth: null, endYear: null });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create budget");
    }
  };

  const confirmDeactivate = (id: string) => {
    setPendingDeactivateId(id);
    setConfirmOpen(true);
  };

  const doDeactivate = async () => {
    if (!pendingDeactivateId) return;
    await api.patch(`/recurring-budgets/${pendingDeactivateId}/deactivate`);
    setConfirmOpen(false);
    setPendingDeactivateId(null);
    fetchData();
  };

  return (
    <div className="flex-1 min-h-screen bg-black text-white px-6 py-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-3xl font-extrabold">Budgets</h1>

        <div className="space-y-4">
          {budgets.map((b) => (
            <div
              key={b._id}
              className="border border-white/20 rounded-lg p-5 bg-black hover:shadow-xl transition cursor-pointer"
              onClick={(e) => {
                if ((e.target as HTMLElement).tagName === "BUTTON") return;
                setSelected(b);
              }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {b.categories
                    .map(
                      (id) =>
                        categories.find((c) => c._id === id)?.name ?? "Unknown"
                    )
                    .join(" | ")}
                </h2>
                <div className="text-sm text-gray-400">
                  {/* Show the current Month and Year */}
                  {new Date().toLocaleString("default", {
                    month: "long",
                    year: "numeric",
                  })}
                </div>
              </div>

              <div className="mt-4">
                <Progress
                  value={b.currentMonth?.percent || 0}
                  className="h-3 bg-white/10"
                  indicatorClassName={
                    (b.currentMonth?.percent || 0) > 100
                      ? "bg-red-500"
                      : (b.currentMonth?.percent || 0) > 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                />
                <div className="text-xs text-gray-400 mt-1">
                  {b.currentMonth?.percent?.toFixed(1) || 0}% used — $
                  {b.currentMonth?.spent?.toFixed(2) || 0} spent
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  onClick={() => confirmDeactivate(b._id)}
                  className="z-10 bg-white text-black rounded-md hover:bg-gray-200"
                >
                  Deactivate
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center">
          <Button
            className="bg-white text-black hover:bg-gray-200"
            onClick={() => setFormOpen(true)}
          >
            Add Budget
          </Button>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-black text-white border border-white/20">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            {/* Start Month Display */}
            <div>
              <label className="text-sm mb-1 block">Start Date</label>
              <Input
                type="text"
                value={`${new Date().toDateString()}`}
                disabled
                className="bg-black border border-white/20 text-white opacity-70 cursor-not-allowed"
              />
            </div>

            {/* Budget Amount */}
            <Input
              type="number"
              name="amount"
              placeholder="Budget Amount"
              value={form.amount}
              onChange={(e) =>
                setForm((f) => ({ ...f, amount: e.target.value }))
              }
              className="bg-black border border-white/20 text-white"
              required
            />

            {/* Category Selection */}
            <div>
              <label className="text-sm mb-1 block">Categories</label>
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
              <label className="text-sm mb-1 block">End Month (optional)</label>
              <div className="flex gap-2">
                <select
                  value={form.endMonth || ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      endMonth: Number(e.target.value) || null,
                    }))
                  }
                  className="bg-black border border-white/20 p-2 rounded text-white"
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
                  className="bg-black border border-white/20 p-2 rounded text-white"
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

            {/* Submit Button */}
            <Button
              type="submit"
              className="mt-2 bg-white text-black w-full hover:bg-gray-100"
            >
              Save Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {selected && (
        <BudgetStatsModal
          open={!!selected}
          onClose={() => setSelected(null)}
          recurringId={selected._id}
        />
      )}

<ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Deactivate Budget?"
        description="This will stop future budgets and archive upcoming ones."
        onConfirm={doDeactivate}
      />

    </div>
  );
}
