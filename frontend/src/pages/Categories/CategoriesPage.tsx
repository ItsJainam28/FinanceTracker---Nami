import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";
import { ConfirmDialog } from "@/components/common/ConfirmDialog";

interface Category {
  _id: string;
  name: string;
}

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
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <div className="max-w-4xl mx-auto py-10 px-4">
        <h1 className="text-3xl font-bold mb-6">Categories</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-10 bg-white p-6 rounded shadow-md">
          <Input
            type="text"
            value={categoryName}
            onChange={(e) => setCategoryName(e.target.value)}
            placeholder="Category Name"
            required
          />

          <Button type="submit">Add Category</Button>
        </form>

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((c) => (
            <div
              key={c._id}
              className="bg-white p-4 rounded shadow-md flex justify-between items-center"
            >
              <div className="text-lg font-semibold">{c.name}</div>
              <Button variant={"secondary"} onClick={()=>{setConfirmId(c._id);setConfirmOpen(true)}}>Delete</Button>
            </div>
          ))}
        </div>
      </div>
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
