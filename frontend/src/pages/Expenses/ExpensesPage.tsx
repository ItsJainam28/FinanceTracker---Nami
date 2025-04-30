import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";
import EditExpenseModal from "@/components/expense/EditExpenseModal";
import { set } from "react-hook-form";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
interface Expense {
  _id: string;
  name: string;
  amount: number;
  date: string;
  categoryId?: string;
  budgetId?: string;
}

interface Category {
  _id: string;
  name: string;
}

interface Budget {
  _id: string;
  name: string;
  startDate: string;
  endDate: string;
}

export default function ExpensesPage() {
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0], // default to today
    categoryId: "",
    budgetId: "",
  });

  const fetchAll = async () => {
    try {
      const [expRes, catRes, budRes] = await Promise.all([
        api.get("/expenses"),
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
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/expenses", {
        name: form.name,
        amount: Number(form.amount),
        date: form.date,
        categoryId: form.categoryId || null,
        budgetId: form.budgetId || null,
      });
      setForm({
        name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
        categoryId: "",
        budgetId: "",
      });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to add expense");
    }
  };

  const handleDelete = async (id: string) => {
    try{
        await api.delete(`/expenses/${id}`);
        fetchAll();
    } catch (err) {
        console.error(err);
        alert("Failed to delete expense");
    }
    };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Expenses</h1>

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
              placeholder="Expense Name"
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
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 text-sm"
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
              value={form.budgetId}
              onChange={handleChange}
              className="border border-gray-300 rounded p-2 text-sm"
            >
              <option value="">Select Budget (optional)</option>
              {budgets.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name} ({new Date(b.startDate).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <Button type="submit">Add Expense</Button>
        </form>

        {/* Expense List */}
        <div className="space-y-4">
          {expenses.map((e) => (
            <div
              key={e._id}
              className="bg-white p-4 rounded shadow-md flex justify-between items-center"
            >
              <div>
                <h2 className="text-lg font-semibold">{e.name}</h2>
                <p className="text-sm text-gray-600">
                  ${e.amount} • {new Date(e.date).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setEditingExpense(e)}>
                Edit
              </Button>
              <Button variant={"secondary"} onClick={() => {setConfirmId(e._id);setConfirmOpen(true)}}>
                Delete
              </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
      {editingExpense && (
        <EditExpenseModal
          open={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          initial={{
            name: editingExpense.name,
            amount: editingExpense.amount,
            date: editingExpense.date.split("T")[0],
            categoryId: editingExpense.categoryId || "",
            budgetId: editingExpense.budgetId || "",
          }}
          categories={categories}
          budgets={budgets}
          onSave={async (updated) => {
            await api.patch(`/expenses/${editingExpense._id}`, updated);
            fetchAll();
          }}
        />
      )}
        {/* Confirm Dialog */}
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
