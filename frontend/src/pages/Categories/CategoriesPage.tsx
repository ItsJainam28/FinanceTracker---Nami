import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";

interface Category {
  _id: string;
  name: string;
}

const colorClasses = [
  "bg-rose-500/20 text-rose-300 border-rose-500",
  "bg-emerald-500/20 text-emerald-300 border-emerald-500",
  "bg-sky-500/20 text-sky-300 border-sky-500",
  "bg-yellow-500/20 text-yellow-300 border-yellow-500",
  "bg-indigo-500/20 text-indigo-300 border-indigo-500",
  "bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post("/categories", { name: categoryName });
      setCategoryName("");
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to create category");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      console.error(err);
      alert("Failed to delete category");
    }
  };

  return (
    <div className="min-h-screen bg-black text-white px-6 py-14">
      <div className="max-w-4xl mx-auto space-y-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Manage Categories</h1>
          <p className="text-sm text-muted-foreground">
            Create custom categories to better organize your expenses.
          </p>
        </div>

        {/* Add Category Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-xl"
        >
          <div>
            <label className="text-sm font-medium">New Category Name</label>
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Travel, Groceries"
              className="bg-zinc-800 border-zinc-700 text-white mt-2"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="bg-white text-black hover:bg-gray-200">
              Add Category
            </Button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Your Categories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">No categories yet. Start by adding one above.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((c, index) => {
                const color = colorClasses[index % colorClasses.length];
                return (
                  <div
                    key={c._id}
                    className={cn(
                      "rounded-xl px-4 py-3 border text-sm font-semibold flex items-center justify-between gap-2 group transition-all",
                      color
                    )}
                  >
                    <span className="truncate">{c.name}</span>
                    <button
                      onClick={() => {
                        setConfirmId(c._id);
                        setConfirmOpen(true);
                      }}
                      className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-red-500 transition"
                    >
                      ✕
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmId && (
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title="Delete Category"
          description="Are you sure you want to delete this category? This action cannot be undone."
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
