import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { createExpense } from "@/api/expenses";
import { listCategories, Category } from "@/api/category";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar } from "../ui/calendar";

export default function AddExpenseForm({onSuccess}: { onSuccess?: () => void }) {
  const qc = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: (payload: {
      name: string;
      amount: number;
      date: string;
      categoryId: string;
      isRecurring: boolean;
    }) => createExpense(payload),
    onSuccess: () => {
      // 1) Invalidate any “expenses” queries. That signals the table’s useQuery to refetch.
      qc.invalidateQueries({ queryKey: ["expenses"] });


      // 3) Show a success toast (optional)
      toast.success("Expense added!");
    },
    onError: () => {
      toast.error("Failed to add expense.");
    },
  });

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

    await mutation.mutateAsync({
      name: formData.name,
      amount: Number(formData.amount),
      date: formData.date,
      categoryId: formData.categoryId,
      isRecurring: false,
    });
      toast.success("Expense added successfully!");
      setFormData({ name: "", amount: "", date: "", categoryId: "" });
      if (onSuccess) onSuccess(); // Call the success callback if provided
    } catch (err) {
      console.error("Failed to create expense:", err);
      toast.error("Failed to create expense.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Expense Name
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Spotify Subscription"
            className="w-full"
            required
          />
        </div>

        {/* Amount */}
        <div className="space-y-2">
          <Label htmlFor="amount" className="text-sm font-medium">
            Amount
          </Label>
          <Input
            id="amount"
            name="amount"
            type="number"
            step="0.01"
            min="0"
            value={formData.amount}
            onChange={handleChange}
            placeholder="0.00"
            className="w-full"
            required
          />
        </div>

        {/* Date */}
        <div className="space-y-2">
          <Label htmlFor="date" className="text-sm font-medium">
            Date
          </Label>
          <div className="relative">
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full pr-10"
              required
            />
            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="categoryId" className="text-sm font-medium">
            Category
          </Label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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
        <div className="pt-4">
          <Button
            type="submit"
            disabled={loading}
            className="w-full"
            onClick={handleSubmit}
          >
            {loading ? "Adding..." : "Add Expense"}
          </Button>
        </div>
      </div>
    </div>
  );
}

