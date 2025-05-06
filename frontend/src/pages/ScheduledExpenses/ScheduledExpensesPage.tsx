import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/common/Navbar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import EditScheduledExpenseModal from "@/components/scheduled/EditScheduledExpenseModal";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

/*──────── Types */
interface ScheduledExpense {
  _id: string;
  name: string;
  amount: number;
  categoryId: string;
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

/*──────── Component */
export default function ScheduledExpensesPage() {
  /* state */
  const [expenses, setExpenses] = useState<ScheduledExpense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<ScheduledExpense | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  /* form state */
  const [form, setForm] = useState({
    name: "",
    amount: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    categoryId: "",
    isActive: true,
  });

  /* fetch data */
  const fetchAll = async () => {
    const [expRes, catRes] = await Promise.all([
      api.get("/recurring-expenses"),
      api.get("/categories"),
    ]);
    setExpenses(expRes.data);
    setCategories(catRes.data);
  };
  useEffect(() => {
    fetchAll();
  }, []);

  /* helpers */
  const catMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  /* form change */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({
      ...p,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  /* submit */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post("/recurring-expenses", {
      ...form,
      amount: Number(form.amount),
      endDate: form.endDate || null,
    });
    setForm((p) => ({
      ...p,
      name: "",
      amount: "",
      categoryId: "",
      isActive: true,
    }));
    fetchAll();
  };

  /* delete */
  const handleDelete = async (id: string) => {
    await api.delete(`/recurring-expenses/${id}`);
    fetchAll();
  };

  /*──────── JSX */
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />
      <div className="max-w-5xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Scheduled Expenses</h1>

        {/* Add form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded shadow space-y-4 mb-10"
        >
          <div className="grid sm:grid-cols-2 gap-4">
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Expense name"
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
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
            />
            <Input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
            />

            {/* category dropdown */}
            <Select
              value={form.categoryId}
              onValueChange={(val) =>
                setForm((p) => ({ ...p, categoryId: val }))
              }
            >
              {/* Trigger: add bg‑white + border so it looks like the other inputs */}
              <SelectTrigger className="bg-white border border-gray-300 rounded px-2 py-2">
                <SelectValue placeholder="Select category…" />
              </SelectTrigger>

              {/* Content (dropdown panel): add bg‑white */}
              <SelectContent className="bg-white border border-gray-200 shadow-md">
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              checked={form.isActive}
              onChange={handleChange}
            />
            Enable auto‑payment
          </label>

          <Button type="submit">Add Scheduled Expense</Button>
        </form>

        {/* table */}
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Start</th>
                <th className="px-4 py-2">Next Trigger</th>
                <th className="px-4 py-2">Category</th>
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
                  <td className="px-4 py-2">{catMap[e.categoryId]}</td>
                  <td className="px-4 py-2">{e.isActive ? "Yes" : "No"}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(e)}
                    >
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

        {/* Confirm */}
        {confirmId && (
          <ConfirmDialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Delete scheduled expense?"
            description="This will stop it from repeating."
            onConfirm={() => {
              handleDelete(confirmId);
              setConfirmOpen(false);
              setConfirmId(null);
            }}
          />
        )}

        {/* Edit modal */}
        {editing && (
          <EditScheduledExpenseModal
            open={!!editing}
            onClose={() => setEditing(null)}
            initial={{
              name: editing.name,
              amount: editing.amount,
              startDate: editing.startDate.split("T")[0],
              endDate: editing.endDate?.split("T")[0],
              categoryId: editing.categoryId,
              isActive: editing.isActive,
            }}
            categories={categories}
            onSave={async (upd) => {
              await api.patch(`/recurring-expenses/${editing._id}`, {
                ...upd,
                amount: Number(upd.amount),
              });
              setEditing(null);
              fetchAll();
            }}
          />
        )}
      </div>
    </div>
  );
}
