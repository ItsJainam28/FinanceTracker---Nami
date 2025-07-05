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
import EditRecurringBudgetModal from "@/components/budget/EditRecurringBudgetModal";
import { NavigationBar } from "@/components/common/Navigationbar";

interface RecurringBudget {
  _id: string;
  name: string;
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
  const [editingBudget, setEditingBudget] = useState<RecurringBudget | null>(null);

  const [form, setForm] = useState({
    name: "",
    amount: "",
    categories: [] as string[],
    endMonth: null as number | null,
    endYear: null as number | null,
  });

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Budgets", isCurrentPage: true },
  ];

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
        name: form.name,
        amount: Number(form.amount),
        categories: form.categories,
        startDate: new Date(),
        endMonth: form.endMonth || null,
        endYear: form.endYear || null,
      });

      setFormOpen(false);
      setForm({
        name: "",
        amount: "",
        categories: [],
        endMonth: null,
        endYear: null,
      });
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
    <div className="flex-1 min-h-screen bg-background text-foreground">
      <NavigationBar items={breadcrumbItems} />
      <main className="px-4 py-4">
        <div className="max-w-7xl mx-auto space-y-8">
          <h1 className="text-3xl font-extrabold">Budgets</h1>

          <div className="space-y-4">
            {budgets.map((b) => (
              <div
                key={b._id}
                className="border border-border rounded-xl p-5 bg-card hover:shadow-xl transition cursor-pointer"
                onClick={(e) => {
                  if ((e.target as HTMLElement).tagName === "BUTTON") return;
                  setSelected(b);
                }}
              >
                <div className="flex justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-card-foreground">{b.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {b.categories
                        .map((id) => categories.find((c) => c._id === id)?.name ?? "Unknown")
                        .join(" | ")}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground self-center">
                    {new Date().toLocaleString("default", {
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>

                <div className="mt-4">
                  <Progress
                    value={b.currentMonth?.percent || 0}
                    className="h-3 bg-muted"
                    indicatorClassName={
                      (b.currentMonth?.percent || 0) > 100
                        ? "bg-red-500"
                        : (b.currentMonth?.percent || 0) > 70
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }
                  />
                  <div className="text-xs text-muted-foreground mt-1">
                    {b.currentMonth?.percent?.toFixed(1) || 0}% used — $
                    {b.currentMonth?.spent?.toFixed(2) || 0} spent
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-4">
                  <Button
                    size="sm"
                    onClick={() => setEditingBudget(b)}
                    className="bg-primary text-primary-foreground hover:bg-primary/80"
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => confirmDeactivate(b._id)}
                    className="bg-muted text-foreground hover:bg-muted/80"
                  >
                    Deactivate
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <Button
              className="bg-primary text-primary-foreground hover:bg-primary/80"
              onClick={() => setFormOpen(true)}
            >
              Add Budget
            </Button>
          </div>
        </div>
      </main>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="bg-card text-card-foreground border border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Budget</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div>
              <label className="text-sm mb-1 block">Name</label>
              <Input
                type="text"
                name="name"
                placeholder="Budget Name"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="bg-card border border-border text-foreground"
                required
              />

              <label className="text-sm mb-1 block mt-3">Start Date</label>
              <Input
                type="text"
                value={`${new Date().toDateString()}`}
                disabled
                className="bg-card border border-border text-muted-foreground opacity-70 cursor-not-allowed"
              />
            </div>

            <Input
              type="number"
              name="amount"
              placeholder="Budget Amount"
              value={form.amount}
              onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
              className="bg-card border border-border text-foreground"
              required
            />

            <div>
              <label className="text-sm mb-1 block">Categories</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((cat) => (
                  <label
                    key={cat._id}
                    className="flex items-center gap-2 text-sm text-foreground"
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
                  className="bg-card border border-border p-2 rounded text-foreground"
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
                  className="bg-card border border-border p-2 rounded text-foreground"
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

            <Button
              type="submit"
              className="mt-2 bg-primary text-primary-foreground w-full hover:bg-primary/80"
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

      {editingBudget && (
        <EditRecurringBudgetModal
          open={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          budget={editingBudget}
          categories={categories}
          onUpdated={fetchData}
        />
      )}
    </div>
  );
}
