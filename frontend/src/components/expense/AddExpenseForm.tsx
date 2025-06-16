import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createExpense } from "@/api/expenses";
import { listCategories, Category } from "@/api/category";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

export default function AddExpenseForm({onSuccess}: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  
  const mutation = useMutation({
    mutationFn: (payload: {
      name: string;
      amount: number;
      date: string;
      categoryId: string;
      isRecurring: boolean;
    }) => createExpense(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("Expense added!");
    },
    onError: () => {
      toast.error("Failed to add expense.");
    },
  });

  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: todayStr,
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
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await mutation.mutateAsync({
        name: form.name,
        amount: Number(form.amount),
        date: form.date,
        categoryId: form.categoryId,
        isRecurring: false,
      });
      
      setForm({ name: "", amount: "", date: todayStr, categoryId: "" });
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error("Failed to create expense:", err);
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
          type="text"
          value={form.name}
          onChange={handleChange}
          placeholder="e.g. Coffee, Lunch, Gas"
          required
          className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Amount */}
      <div className="space-y-1.5">
        <Label htmlFor="amount">Amount</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          step="0.01"
          min="0"
          value={form.amount}
          onChange={handleChange}
          placeholder="0.00"
          required
          className="bg-background border border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-ring"
        />
      </div>

      {/* Date */}
      <div className="space-y-1.5">
        <Label htmlFor="date">Date</Label>
        <Input
          id="date"
          name="date"
          type="date"
          value={form.date}
          onChange={handleChange}
          required
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

      {/* Submit */}
      <div className="pt-4">
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? "Adding..." : "Add Expense"}
        </Button>
      </div>
    </form>
  );
}