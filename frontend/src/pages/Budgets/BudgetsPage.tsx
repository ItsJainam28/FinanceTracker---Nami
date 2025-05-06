// src/pages/BudgetPage.tsx
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import Navbar from "@/components/common/Navbar";
import api from "@/api/axiosInstance";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import * as Popover from "@radix-ui/react-popover";
import BudgetStatsModal from "@/components/budget/BudgetStatsModal";
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

export default function BudgetPage() {
  const [form, setForm] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    amount: "",
    categories: [] as string[],
    isRecurring: true,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [statsBudget, setStatsBudget] = useState<Budget | null>(null);
  const [editing, setEditing] = useState<Budget | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statsTimeline, setStatsTimeline] = useState<Budget[]>([]);

  // Fetch budgets + categories
  const fetchData = async () => {
    try {
      const [budRes, catRes] = await Promise.all([
        api.get("/budgets"),
        api.get("/categories"),
      ]);
      setBudgets(budRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  // helper to generate a list of related budgets
  const buildTimeline = (base: Budget) => {
    const sameCats = (a: string[], b: string[]) =>
      a.length === b.length && a.every((id) => b.includes(id));

    return budgets
      .filter(
        (b) =>
          sameCats(b.categories, base.categories) && // same category set
          b.isRecurring === base.isRecurring // same recurring flag
      )
      .sort((a, b) => a.year - b.year || a.month - b.month); // oldest → newest
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handle form changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (name === "amount") {
      setForm((p) => ({ ...p, [name]: value }));
    } else if (type === "checkbox") {
      setForm((p) => ({
        ...p,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((p) => ({ ...p, [name]: Number(value) }));
    }
  };

  // Toggle category selection
  const toggleCategory = (id: string) => {
    setForm((p) => ({
      ...p,
      categories: p.categories.includes(id)
        ? p.categories.filter((c) => c !== id)
        : [...p.categories, id],
    }));
  };

  // Submit create budget
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/budgets", {
        month: form.month,
        year: form.year,
        amount: Number(form.amount),
        categories: form.categories,
        isRecurring: form.isRecurring,
      });
      setForm((p) => ({ ...p, amount: "", categories: [], isRecurring: true }));
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to add budget");
    }
  };

  // Delete budget
  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchData();
    } catch {
      alert("Failed to delete");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Budgets</h1>

        {/* Add Budget Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md mb-10 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Month */}
            <div>
              <label className="text-sm font-medium block mb-1">Month</label>
              <select
                name="month"
                value={form.month}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {new Date(0, i).toLocaleString("default", {
                      month: "long",
                    })}
                  </option>
                ))}
              </select>
            </div>
            {/* Year */}
            <div>
              <label className="text-sm font-medium block mb-1">Year</label>
              <select
                name="year"
                value={form.year}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              >
                {/* Last 5 years for example */}
                {Array.from({ length: 5 }).map((_, i) => {
                  const y = new Date().getFullYear() - (4 - i);
                  return (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  );
                })}
              </select>
            </div>
            {/* Amount */}
            <div>
              <label className="text-sm font-medium block mb-1">
                Amount ($)
              </label>
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 500"
                required
              />
            </div>
            {/* Recurring */}
            <div className="flex items-center mt-6">
              <Checkbox
                checked={form.isRecurring}
                onCheckedChange={(c) =>
                  setForm((p) => ({ ...p, isRecurring: !!c }))
                }
              />
              <span className="ml-2 text-sm">Repeat every month</span>
            </div>

            {/* Categories – now a dropdown with checkboxes */}
            <div className="sm:col-span-2">
              <label className="text-sm font-medium block mb-1">
                Categories
              </label>
              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant="outline" className="w-full justify-between">
                    {form.categories.length
                      ? form.categories
                          .map(
                            (id) => categories.find((c) => c._id === id)?.name
                          )
                          .join(", ")
                      : "Select categories…"}
                  </Button>
                </Popover.Trigger>

                <Popover.Portal>
                  <Popover.Content
                    className="bg-white border rounded-md shadow-md p-4 w-64"
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

                    {/* Use Popover.Close instead of calling close() */}
                    <div className="text-right mt-2">
                      <Popover.Close asChild>
                        <Button variant="secondary" size="sm">
                          Done
                        </Button>
                      </Popover.Close>
                    </div>
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            </div>
          </div>
          <Button type="submit">Add Budget</Button>
        </form>

        {/* Budgets Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Month</th>
                <th className="px-4 py-2">Year</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Categories</th>
                <th className="px-4 py-2">Recurring</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b._id} className="border-t">
                  <td className="px-4 py-2">
                    {new Date(b.year, b.month - 1).toLocaleString("default", {
                      month: "short",
                    })}
                  </td>
                  <td className="px-4 py-2">{b.year}</td>
                  <td className="px-4 py-2">${b.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {b.categories.length ?  b.categories
        .map(id => categories.find(c => c._id === id)?.name ?? "Unknown")
        .join(", ") : "All"}
                  </td>
                  <td className="px-4 py-2">{b.isRecurring ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button variant="outline" onClick={() => setEditing(b)}>
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setStatsBudget(b);
                        setStatsTimeline(buildTimeline(b));
                      }}
                    >
                      View
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => {
                        setSelectedId(b._id);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Edit Modal */}
        {editing && (
          <EditBudgetModal
            open={!!editing}
            onClose={() => setEditing(null)}
            initial={{
              month: editing.month,
              year: editing.year,
              amount: editing.amount,
              categories: editing.categories, // <-- array of IDs
              isRecurring: editing.isRecurring,
            }}
            categories={categories} // <-- full list of { _id, name }
            onSave={async (updated) => {
              await api.patch(`/budgets/${editing._id}`, updated);
              setEditing(null);
              fetchData();
            }}
          />
        )}

        {/* Delete Confirm */}
        {selectedId && (
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Delete Budget?"
            description="This will remove this month's budget."
            onConfirm={() => {
              handleDelete(selectedId);
              setConfirmOpen(false);
              setSelectedId(null);
            }}
          />
        )}

        {statsBudget && (
          <BudgetStatsModal
            open={!!statsBudget}
            onClose={() => setStatsBudget(null)}
            budget={statsBudget}
            timeline={statsTimeline} // ← pass timeline array
          />
        )}
      </div>
    </div>
  );
}
