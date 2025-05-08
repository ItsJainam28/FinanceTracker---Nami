import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import api from "@/api/axiosInstance";
import EditExpenseModal from "@/components/expense/EditExpenseModal";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/* ───────────── Types ───────────── */
interface Expense {
  _id: string;
  name: string;
  amount: number;
  date: string;
  categoryId: string;
}

interface Category {
  _id: string;
  name: string;
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  /* form state */
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
    categoryId: "",
  });

  /* fetch data */
  const fetchAll = async () => {
    const [expRes, catRes] = await Promise.all([
      api.get("/expenses"),
      api.get("/categories"),
    ]);
    setExpenses(expRes.data);
    setCategories(catRes.data);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  /* handle text/number inputs */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  /* submit new expense */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/expenses", {
      ...form,
      amount: Number(form.amount),
    });
    setForm((p) => ({
      ...p,
      name: "",
      amount: "",
      categoryId: "",
    }));
    fetchAll();
  };

  /* delete */
  const handleDelete = async (id: string) => {
    await api.delete(`/expenses/${id}`);
    fetchAll();
  };

  /* quick map for category names */
  const catMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  /* ───────────── UI ───────────── */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
     

      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Expenses</h1>

        {/* Add Expense Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow-md mb-10 space-y-4"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              type="text"
              name="name"
              placeholder="Expense name"
              value={form.name}
              onChange={handleChange}
              required
            />
            <Input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            {/* Category select */}
            <Select
              value={form.categoryId}
              onValueChange={(val) => setForm((p) => ({ ...p, categoryId: val }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit">Add Expense</Button>
        </form>

        {/* Expense Table */}
<div className="overflow-x-auto bg-white rounded shadow">
  <table className="min-w-full text-sm text-left">
    <thead className="bg-gray-100 border-b">
      <tr>
        <th className="px-4 py-2">Name</th>
        <th className="px-4 py-2">Amount</th>
        <th className="px-4 py-2">Date</th>
        <th className="px-4 py-2">Category</th>
        <th className="px-4 py-2">Actions</th>
      </tr>
    </thead>

    <tbody>
      {expenses.map((e) => (
        <tr key={e._id} className="border-t">
          <td className="px-4 py-2">{e.name}</td>
          <td className="px-4 py-2">${e.amount.toFixed(2)}</td>
          <td className="px-4 py-2">
            {new Date(e.date).toLocaleDateString()}
          </td>
          <td className="px-4 py-2">{catMap[e.categoryId] ?? "Unknown"}</td>
          <td className="px-4 py-2 flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setEditing(e)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => {
                setConfirmId(e._id);
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

   
      </div>

      {/* Edit modal */}
      {editing && (
        <EditExpenseModal
          open={!!editing}
          onClose={() => setEditing(null)}
          initial={{
            name: editing.name,
            amount: editing.amount,
            date: editing.date.split("T")[0],
            categoryId: editing.categoryId,
          }}
          categories={categories}
          onSave={async (updated) => {
            await api.patch(`/expenses/${editing._id}`, {
              ...updated,
              amount: Number(updated.amount),
            });
            setEditing(null);
            fetchAll();
          }}
        />
      )}

      {/* Confirm delete */}
      {confirmId && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete expense?"
          description="This action cannot be undone."
          onConfirm={() => {
            handleDelete(confirmId);
            setConfirmOpen(false);
            setConfirmId(null);
          }}
        />
      )}
    </div>
  );
}
