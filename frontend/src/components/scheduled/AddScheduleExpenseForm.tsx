import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { createScheduledExpense, getUserTimezone } from "@/api/scheduledExpense";
import { listCategories, Category } from "@/api/category";
import { toast } from "sonner";
import { format } from "date-fns";

interface AddScheduledExpenseFormProps {
  onSuccess: () => void;
}

export default function AddScheduledExpenseForm({ onSuccess }: AddScheduledExpenseFormProps) {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const userTimezone = getUserTimezone();

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
      await createScheduledExpense(userTimezone, {
        name: form.name,
        amount: Number(form.amount),
        startDate: form.startDate,
        endDate: form.endDate || undefined,
        categoryId: form.categoryId,
        isActive: form.isActive,
        logIfPast: form.logIfPast,
      });

      toast.success("Scheduled expense added");
      onSuccess();
    } catch (err) {
      console.error("Error creating scheduled expense", err);
      toast.error("Failed to add scheduled expense");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 overflow-visible">
      {/* Name */}
      <div className="space-y-1.5">
        <Label htmlFor="name">Expense Name</Label>
        <Input
          id="name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Spotify, Gym, Rent"
          required
          className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          type="number"
          name="amount"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          step="0.01"
          required
          className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Start Date */}
      <div className="space-y-1.5">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          name="startDate"
          value={form.startDate}
          onChange={handleChange}
          required
          className="bg-background border border-input text-foreground focus-visible:ring-ring"
        />
      </div>

      {/* End Date */}
      <div className="space-y-1.5">
        <Label htmlFor="endDate">End Date (optional)</Label>
        <Input
          id="endDate"
          type="date"
          name="endDate"
          value={form.endDate}
          onChange={handleChange}
          className="bg-background border border-input text-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Category */}
      <div className="space-y-1.5">
        <Label htmlFor="categoryId">Category</Label>
        <select
          id="categoryId"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          required
          className="w-full rounded-md bg-card border border-input text-foreground px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 placeholder:text-muted-foreground"
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
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <Label>Auto‑payment enabled</Label>
          <p className="text-xs text-muted-foreground">
            Pause this anytime later from the list view.
          </p>
        </div>
        <Switch
          checked={form.isActive}
          onCheckedChange={(val) => setForm((p) => ({ ...p, isActive: val }))}
          className="data-[state=checked]:bg-primary"
        />
      </div>

      {/* logIfPast toggle */}
      {new Date(form.startDate) < new Date(todayStr) && (
        <div className="flex items-center justify-between pt-1">
          <div className="space-y-0.5">
            <Label>Log for this month</Label>
            <p className="text-xs text-muted-foreground">
              Should we include this in the current month's records?
            </p>
          </div>
          <Switch
            checked={form.logIfPast}
            onCheckedChange={(val) =>
              setForm((p) => ({ ...p, logIfPast: val }))
            }
            className="data-[state=checked]:bg-primary"
          />
        </div>
      )}

      {/* Submit */}
      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Saving..." : "Add Scheduled Expense"}
        </Button>
      </div>
    </form>
  );
}
