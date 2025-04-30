import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import Navbar from "@/components/common/Navbar";
import EditScheduledExpenseModal from "@/components/scheduled/EditScheduledExpenseModal";
interface ScheduledExpense {
  _id: string;
  name: string;
  amount: number;
  categoryId?: string;
  budgetId?: string;
  startDate: string;
  endDate?: string;
  frequency: string;
  nextTriggerDate: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
}

interface Budget {
  _id: string;
  name: string;
}

export default function ScheduledExpensesPage() {
  const [expenses, setExpenses] = useState<ScheduledExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<ScheduledExpense | null>(
    null
  );

  const [form, setForm] = useState({
    name: "",
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    categoryId: "",
    budgetId: "",
    isActive: true,
  });

  const fetchAll = async () => {
    try {
      const [expRes, catRes, budRes] = await Promise.all([
        api.get("/recurring-expenses"),
        api.get("/categories"),
        api.get("/budgets"),
      ]);
      setExpenses(expRes.data);
      setCategories(catRes.data);
      setBudgets(budRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      setForm((prev) => ({
        ...prev,
        [name]: (e.target as HTMLInputElement).checked,
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/recurring-expenses", {
        ...form,
        amount: Number(form.amount),
        endDate: form.endDate || null,
      });
      setForm({
        name: "",
        amount: "",
        startDate: new Date().toISOString().split("T")[0],
        endDate: "",
        categoryId: "",
        budgetId: "",
        isActive: true,
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to add scheduled expense");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/recurring-expenses/${id}`);
      fetchAll();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Scheduled Expenses</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4 mb-10"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Expense Name
              </label>
              <Input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Netflix, Gym"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Amount ($)
              </label>
              <Input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                placeholder="e.g. 15.99"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Start Date
              </label>
              <Input
                type="date"
                name="startDate"
                value={form.startDate}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-gray-500">
                This is when the auto-expense starts.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                End Date (optional)
              </label>
              <Input
                type="date"
                name="endDate"
                value={form.endDate}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500">
                Leave blank to continue indefinitely.
              </p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Category</label>
              <select
                name="categoryId"
                value={form.categoryId}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">
                Assign to Budget (optional)
              </label>
              <select
                name="budgetId"
                value={form.budgetId}
                onChange={handleChange}
                className="w-full border border-gray-300 p-2 rounded text-sm"
              >
                <option value="">No Budget</option>
                {budgets.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            <label className="text-sm">Enable Auto-Payment</label>
          </div>

          <Button type="submit" className="mt-2">
            Add Scheduled Expense
          </Button>
        </form>

        {/* Table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Next Trigger</th>
                <th className="px-4 py-2">Active</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id} className="border-t">
                  <td className="px-4 py-2">{e.name}</td>
                  <td className="px-4 py-2">${e.amount.toFixed(2)}</td>
                  <td className="px-4 py-2">
                    {new Date(e.startDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    {new Date(e.nextTriggerDate).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">{e.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-2">
                    <Button
                      variant="outline"
                      onClick={() => setEditingExpense(e)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setSelectedId(e._id);
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

        {selectedId && (
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Delete Scheduled Expense"
            description="This action will stop it from repeating."
            onConfirm={() => {
              handleDelete(selectedId);
              setConfirmOpen(false);
              setSelectedId(null);
            }}
          />
        )}
        {editingExpense && (
  <EditScheduledExpenseModal
    open={!!editingExpense}
    onClose={() => setEditingExpense(null)}
    initial={{
      name: editingExpense.name,
      amount: editingExpense.amount,
      startDate: editingExpense.startDate.split("T")[0],
      endDate: editingExpense.endDate?.split("T")[0],
      categoryId: editingExpense.categoryId || "",
      budgetId: editingExpense.budgetId || "",
      isActive: editingExpense.isActive,
    }}
    categories={categories}
    budgets={budgets}
    onSave={async (updated) => {
      await api.patch(`/recurring-expenses/${editingExpense._id}`, updated);
      fetchAll();
    }}
  />
)}

      </div>
    </div>
  );
}
