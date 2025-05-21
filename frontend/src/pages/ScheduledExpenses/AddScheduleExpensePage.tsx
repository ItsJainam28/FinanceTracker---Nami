import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createScheduledExpense } from "@/api/scheduledExpense";
import { listCategories, Category } from "@/api/category";
import { toast } from "sonner";
import { format } from "date-fns";

export default function AddScheduledExpensePage() {
  const navigate = useNavigate();
  const todayStr = format(new Date(), "yyyy-MM-dd");

  const [form, setForm] = useState({
    name: "",
    amount: "",
    startDate: todayStr,
    endDate: "",
    categoryId: "",
    isActive: true,
    logIfPast: true,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Failed to load categories", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const target = e.target;

    if (target instanceof HTMLInputElement && target.type === "checkbox") {
      setForm((prev) => ({ ...prev, [target.name]: target.checked }));
    } else {
      setForm((prev) => ({ ...prev, [target.name]: target.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createScheduledExpense({
        name: form.name,
        amount: Number(form.amount),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        categoryId: form.categoryId,
        isActive: form.isActive,
        logIfPast: form.logIfPast,
      });

      toast.success("Scheduled expense added");
      navigate("/scheduled-expenses");
    } catch (err) {
      console.error("Error creating scheduled expense", err);
      toast.error("Failed to add scheduled expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-8 py-14 bg-black text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">
            Add Scheduled Expense
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-zinc-900 p-10 rounded-xl border border-zinc-800 shadow-2xl"
        >
          {/* Name */}
          <div>
            <Label className="text-sm">Expense Name</Label>
            <p className="text-xs text-muted-foreground mb-1">
              What is this recurring payment for? E.g. “Spotify”, “Gym”, or
              “Rent”.
            </p>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm">Amount</Label>
            <p className="text-xs text-muted-foreground mb-1">
              The amount charged each billing cycle.
            </p>
            <Input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          {/* Start Date */}
          <div>
            <Label className="text-sm">Start Date</Label>
            <p className="text-xs text-muted-foreground mb-1">
              When should this recurring payment start?
            </p>
            <Input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          {/* End Date */}
          <div>
            <Label className="text-sm">End Date (optional)</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Leave this blank if it continues indefinitely.
            </p>
            <Input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              className="bg-zinc-800 border-zinc-700 text-white"
            />
          </div>

          {/* Category */}
          <div>
            <Label className="text-sm">Category</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Helps you group and analyze this expense in dashboards.
            </p>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2"
            >
              <option value="" disabled>
                Select category
              </option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* isActive toggle */}
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-sm">Auto‑payment enabled</Label>
              <p className="text-xs text-muted-foreground">
                Pause this anytime later from the list view.
              </p>
            </div>
            <Switch
              checked={form.isActive}
              onCheckedChange={(val) =>
                setForm((p) => ({ ...p, isActive: val }))
              }
            />
          </div>

          {/* logIfPast toggle */}
          {new Date(form.startDate) < new Date(todayStr) && (
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm">Log for this month</Label>
                <p className="text-xs text-muted-foreground">
                  Should we include this in the current month’s records?
                </p>
              </div>
              <Switch
            
                checked={form.logIfPast}
                onCheckedChange={(val) =>
                  setForm((p) => ({ ...p, logIfPast: val }))
                }
              />
            </div>
          )}

          {/* Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-base font-medium py-2.5 hover:bg-gray-200 transition"
            >
              {loading ? "Saving..." : "Add Scheduled Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
