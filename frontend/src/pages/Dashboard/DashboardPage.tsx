import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";
import { useNavigate } from "react-router-dom";

interface User {
  firstname: string;
  lastname: string;
  email: string;
}

interface Budget {
  _id: string;
  name: string;
  amount: number;
  startDate: string;
  endDate: string;
}

interface Expense {
  _id: string;
  name: string;
  amount: number;
  date: string;
}

interface Category {
  _id: string;
  name: string;
}


export default function DashboardPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [budgetsRes, expensesRes, categoriesRes] = await Promise.all([
          api.get("/budgets"),
          api.get("/expenses"),
          api.get("/categories"),
        ]);

        setBudgets(budgetsRes.data);
        setExpenses(expensesRes.data);
        setCategories(categoriesRes.data);

      } catch (error) {
        console.error(error);
        alert("Session expired. Please login again.");
        localStorage.removeItem("token");
        navigate("/login");
      }
    };

    fetchData();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Navbar />

      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Total Budgets */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold">Total Budgets</h2>
            <p className="text-4xl font-bold mt-4">{budgets.length}</p>
          </div>

          {/* Total Expenses */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold">Total Expenses</h2>
            <p className="text-4xl font-bold mt-4">{expenses.length}</p>
          </div>

          {/* Total Categories */}
          <div className="bg-white shadow-md rounded-lg p-6 text-center">
            <h2 className="text-xl font-semibold">Total Categories</h2>
            <p className="text-4xl font-bold mt-4">{categories.length}</p>
          </div>

        </div>
      </div>
    </div>
  );
}
