import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";
import EditBudgetModal from "@/components/budget/EditBudgetModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
interface Budget {
  _id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
  isRecurring: boolean;
}

export default function BudgetsPage() {
  const currentMonth = new Date().getMonth() + 1; // January = 0, so +1
  const currentYear = new Date().getFullYear();
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    month: currentMonth.toString(),
    isRecurring: false,
  });

  const fetchBudgets = async () => {
    try {
      const res = await api.get("/budgets");
      setBudgets(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/budgets", {
        name: form.name,
        amount: Number(form.amount),
        month: Number(form.month),
        year: currentYear, // always use current year
        isRecurring: form.isRecurring,
      });
      setForm({
        name: "",
        amount: "",
        month: currentMonth.toString(),
        isRecurring: false,
      });
      fetchBudgets();
    } catch (err) {
      console.error(err);
      alert("Failed to create budget");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/budgets/${id}`);
      fetchBudgets();
    } catch (err) {
      console.error(err);
      alert("Failed to delete budget");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      {editingBudget && (
        <EditBudgetModal
          open={!!editingBudget}
          onClose={() => setEditingBudget(null)}
          initial={{
            name: editingBudget.name,
            amount: editingBudget.amount,
            month: new Date(editingBudget.startDate).getMonth() + 1,
            isRecurring: editingBudget.isRecurring,
          }}
          onSave={async (updated) => {
            await api.patch(`/budgets/${editingBudget._id}`, {
              ...updated,
              year: new Date(editingBudget.startDate).getFullYear(),
            });
            fetchBudgets();
          }}
        />
      )}

      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Budgets</h1>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 mb-10 bg-white p-6 rounded shadow-md"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Budget Name"
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
            <select
              name="month"
              value={form.month}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 text-sm"
              required
            >
              {/* Month dropdown */}
              {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                <option key={m} value={m}>
                  {new Date(0, m - 1).toLocaleString("default", {
                    month: "long",
                  })}
                </option>
              ))}
            </select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isRecurring"
              checked={form.isRecurring}
              onChange={handleChange}
            />
            Repeat every month
          </label>

          <Button type="submit">Add Budget</Button>
        </form>

        {/* Budget List */}
        <div className="space-y-4">
          {budgets.map((b) => (
            <div
              key={b._id}
              className="bg-white p-4 rounded shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{b.name}</h2>
                <p className="text-sm text-gray-600">
                  ${b.amount} • {new Date(b.startDate).toLocaleDateString()} to{" "}
                  {new Date(b.endDate).toLocaleDateString()}
                </p>
                {b.isRecurring && (
                  <p className="text-sm text-blue-600 font-medium">Recurring</p>
                )}
              </div>

              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setEditingBudget(b)}>
                  Edit
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setConfirmId(b._id);
                    setConfirmOpen(true);
                  }}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Confirm Diagloge */}
      {confirmId && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Are you sure?"
          description="This action cannot be undone."
          onConfirm={() => {
            handleDelete(confirmId || "");
            setConfirmId(null);
            setConfirmOpen(false);
          }}
        />
      )}
    </div>
  );
}
