import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { createExpense } from "@/api/expenses";
import { listCategories, Category } from "@/api/category";
import { toast } from "sonner";

export default function AddExpenseForm() {
  const [formData, setFormData] = useState({
    name: "",
    amount: "",
    date: "",
    categoryId: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listCategories()
      .then((res) => setCategories(res.data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createExpense({
        name: formData.name,
        amount: Number(formData.amount),
        date: formData.date,
        categoryId: formData.categoryId,
        isRecurring: false,
      });
      toast.success("Expense added successfully!");
      setFormData({ name: "", amount: "", date: "", categoryId: "" });
    } catch (err) {
      console.error("Failed to create expense:", err);
      toast.error("Failed to create expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-8 py-14 bg-black text-white">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Add Expense</h1>
        
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-8 bg-zinc-900 p-10 rounded-xl border border-zinc-800 shadow-2xl"
        >
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-sm">Expense Name</Label>
            <p className="text-xs text-muted-foreground mb-1">
              This could be anything like "Netflix", "Uber", or "Dinner at Olive Garden".
            </p>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Spotify Subscription"
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          {/* Amount */}
          <div>
            <Label htmlFor="amount" className="text-sm">Amount</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Enter the cost of the transaction (in your default currency).
            </p>
            <Input
              id="amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleChange}
              placeholder="e.g. 18.99"
              className="bg-zinc-800 border-zinc-700 text-white"
              required
            />
          </div>

          {/* Date */}
          <div>
            <Label htmlFor="date" className="text-sm">Date</Label>
            <p className="text-xs text-muted-foreground mb-1">
              The date this expense occurred or will occur.
            </p>
            <div className="relative">
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                className="bg-zinc-800 border-zinc-700 text-white pr-10"
                required
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
          </div>

          {/* Category */}
          <div>
            <Label htmlFor="categoryId" className="text-sm">Category</Label>
            <p className="text-xs text-muted-foreground mb-1">
              Helps group this expense when viewing stats or budgets.
            </p>
            <select
              id="categoryId"
              name="categoryId"
              value={formData.categoryId}
              onChange={handleChange}
              className="w-full rounded-md bg-zinc-800 border border-zinc-700 text-white px-3 py-2"
              required
            >
              <option value="" disabled>Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Submit */}
          <div className="pt-6">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black text-base font-medium py-2.5 hover:bg-gray-200 transition"
            >
              {loading ? "Adding..." : "Add Expense"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
