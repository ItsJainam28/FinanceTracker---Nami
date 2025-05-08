// New stylized BudgetPage.tsx with card layout, modal form, progress bar, and animations
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import api from "@/api/axiosInstance";
import BudgetStatsModal from "@/components/budget/BudgetStatsModal";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

interface Budget {
  _id: string;
  month: number;
  year: number;
  amount: number;
  categories: string[];
  isRecurring: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface Stat {
  spent: number;
  percent: number;
}

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [statsMap, setStatsMap] = useState<Record<string, Stat>>({});
  const [formOpen, setFormOpen] = useState(false);
  const [statsBudget, setStatsBudget] = useState<Budget | null>(null);
  const [editing, setEditing] = useState<Budget | null>(null);

  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
    categories: [] as string[],
    isRecurring: true,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/categories"),
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data);

      const stats: Record<string, Stat> = {};
      await Promise.all(
        budRes.data.map(async (b: Budget) => {
          try {
            const res = await api.get(
              `/budgets/${b._id}/month-summary?month=${b.month}&year=${b.year}`
            );
            stats[b._id] = {
              spent: res.data.spent,
              percent: res.data.percent,
            };
          } catch {
            stats[b._id] = { spent: 0, percent: 0 };
          }
        })
      );
      setStatsMap(stats);
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
      await api.post("/budgets", {
        ...form,
        amount: Number(form.amount),
      });
      setFormOpen(false);
      setForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: "",
        categories: [],
        isRecurring: true,
      });
      fetchData();
    } catch (err) {
      alert("Failed to add budget");
    }
  };

  const monthName = (m: number) =>
    new Date(0, m - 1).toLocaleString("default", { month: "long" });

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
                setStatsBudget(b);
              }}
            >
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold">
                  {b.categories
                    .map((id) =>
                      categories.find((c) => c._id === id)?.name ?? "Unknown"
                    )
                    .join(" | ") || "All Categories"}
                </h2>
                <div className="text-sm text-gray-400">
                  {monthName(b.month)} {b.year}
                </div>
              </div>

              <div className="mt-4">
                <Progress
                  value={statsMap[b._id]?.percent || 0}
                  className="h-3 bg-white/10"
                  indicatorClassName={
                    statsMap[b._id]?.percent > 100
                      ? "bg-red-500"
                      : statsMap[b._id]?.percent > 70
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }
                />
                <div className="text-xs text-gray-400 mt-1">
                  {statsMap[b._id]?.percent?.toFixed(1) || 0}% used — $
                  {statsMap[b._id]?.spent?.toFixed(2) || 0} spent
                </div>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(b)}
                  className="z-10"
                >
                  Edit
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={async () => {
                    await api.delete(`/budgets/${b._id}`);
                    fetchData();
                  }}
                  className="z-10"
                >
                  Delete
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
            <div className="flex gap-3">
              <select
                name="month"
                value={form.month}
                onChange={(e) =>
                  setForm((f) => ({ ...f, month: Number(e.target.value) }))
                }
                className="bg-black border border-white/20 p-2 rounded"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1} className="text-gray-500">
                    {monthName(i + 1)}
                  </option>
                ))}
              </select>
              <select
                name="year"
                value={form.year}
                onChange={(e) =>
                  setForm((f) => ({ ...f, year: Number(e.target.value) }))
                }
                className="bg-black border border-white/20 p-2 rounded"
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

            <div className="flex items-center gap-2">
              <Checkbox
                checked={form.isRecurring}
                onCheckedChange={(c) =>
                  setForm((p) => ({ ...p, isRecurring: !!c }))
                }
              />
              <span className="text-sm">Recurring</span>
            </div>

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

            <Button
              type="submit"
              className="mt-2 bg-white text-black w-full hover:bg-gray-100"
            >
              Save Budget
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      {statsBudget && (
        <BudgetStatsModal
          open={!!statsBudget}
          onClose={() => setStatsBudget(null)}
          budget={statsBudget}
          timeline={budgets
            .filter(
              (b) =>
                JSON.stringify(b.categories.sort()) ===
                  JSON.stringify(statsBudget.categories.sort()) &&
                b.isRecurring === statsBudget.isRecurring
            )
            .sort((a, b) => a.year - b.year || a.month - b.month)}
        />
      )}

      {editing && (
        <EditBudgetModal
          open={!!editing}
          onClose={() => setEditing(null)}
          initial={editing}
          categories={categories}
          onSave={async (updated) => {
            await api.patch(`/budgets/${editing._id}`, updated);
            setEditing(null);
            fetchData();
          }}
        />
      )}
    </div>
  );
}
