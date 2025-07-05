import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";
import { cn } from "@/lib/utils";
import { NavigationBar } from "@/components/common/Navigationbar";

interface Category {
  _id: string;
  name: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Categories", isCurrentPage: true },
  ];

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
    <div className="min-h-screen bg-background text-foreground">
      <NavigationBar items={breadcrumbItems} />

      {/* Match Dashboard spacing here */}
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Manage Categories</h1>
          <p className="text-muted-foreground text-sm">
            Create custom categories to better organize your expenses.
          </p>
        </div>

        {/* Add Category Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 bg-muted p-6 rounded-xl border border-border shadow-sm"
        >
          <div>
            <label className="text-sm font-medium">New Category Name</label>
            <Input
              type="text"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              placeholder="e.g. Travel, Groceries"
              className="mt-2"
              required
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit">Add Category</Button>
          </div>
        </form>

        {/* Category List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Categories</h2>
          {categories.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No categories yet. Start by adding one above.
            </p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {categories.map((c) => (
                <div
                  key={c._id}
                  className={cn(
                    "bg-muted text-foreground border border-border rounded-xl px-4 py-3 text-sm font-semibold flex items-center justify-between gap-2 group transition-all"
                  )}
                >
                  <span className="truncate">{c.name}</span>
                  <button
                    onClick={() => {
                      setConfirmId(c._id);
                      setConfirmOpen(true);
                    }}
                    className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 hover:text-destructive transition"
                  >
                    ✕
                  </button>
                </div>
              ))}
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
