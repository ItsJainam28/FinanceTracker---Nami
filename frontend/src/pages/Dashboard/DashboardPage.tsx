/* src/pages/DashboardPage.tsx */
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Line, Pie, Bar } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

/* ──────────────────────────────── TYPES */
interface Analytics {
  totalSpending: number;
  topCategories: { _id: string; total: number }[];
  dailyTrend: { _id: string; total: number }[];
  budgetVsSpending: { category: string; budgetAmount: number; spent: number }[];
  largestExpenses: { name: string; amount: number }[];
}

/* ──────────────────────────────── COMPONENT */
export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [counts, setCounts] = useState({ budgets: 0, expenses: 0, categories: 0 });

  /* fetch analytics + quick counts */
  useEffect(() => {
    (async () => {
      const [anaRes, budRes, expRes, catRes] = await Promise.all([
        api.get("/analytics/summary"),
        api.get("/budgets"),
        api.get("/expenses"),
        api.get("/categories"),
      ]);
      setAnalytics(anaRes.data);
      setCounts({
        budgets: budRes.data.length,
        expenses: expRes.data.length,
        categories: catRes.data.length,
      });
    })();
  }, []);

  if (!analytics) return <div className="min-h-screen flex items-center justify-center">Loading…</div>;

  /* chart data helpers */
  const dailyLine = {
    labels: analytics.dailyTrend.map((d) => d._id),
    datasets: [
      {
        label: "Daily Spend",
        data: analytics.dailyTrend.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(14,165,233,0.15)",
        borderColor: "#0ea5e9",
        tension: 0.3,
      },
    ],
  };

  const categoryPie = {
    labels: analytics.topCategories.map((c) => c._id || "Uncategorised"),
    datasets: [
      {
        data: analytics.topCategories.map((c) => c.total),
        backgroundColor: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8"],
      },
    ],
  };

  const budgetBar = {
    labels: analytics.budgetVsSpending.map((b) => b.category || "No Cat"),
    datasets: [
      {
        label: "Budgeted",
        data: analytics.budgetVsSpending.map((b) => b.budgetAmount),
        backgroundColor: "#22c55e",
      },
      {
        label: "Spent",
        data: analytics.budgetVsSpending.map((b) => b.spent),
        backgroundColor: "#ef4444",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
        {/* Welcome banner */}
        <div className="text-2xl font-semibold">Welcome back! 🎉</div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card>
            <CardHeader><CardTitle>Total Budgets</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{counts.budgets}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Total Expenses</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{counts.expenses}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>Categories</CardTitle></CardHeader>
            <CardContent className="text-3xl font-bold">{counts.categories}</CardContent>
          </Card>
        </div>

        {/* Total spending number */}
        <Card>
          <CardHeader><CardTitle>This-month spending</CardTitle></CardHeader>
          <CardContent className="text-4xl font-extrabold text-emerald-600">
            ${analytics.totalSpending.toFixed(2)}
          </CardContent>
        </Card>

        {/* Charts grid */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Daily trend */}
          <Card>
            <CardHeader><CardTitle>Daily trend</CardTitle></CardHeader>
            <CardContent><Line data={dailyLine} /></CardContent>
          </Card>

          {/* Category pie */}
          <Card>
            <CardHeader><CardTitle>Top categories</CardTitle></CardHeader>
            <CardContent><Pie data={categoryPie} /></CardContent>
          </Card>

          {/* Budget vs spend bar (spans two cols) */}
          <Card className="lg:col-span-2">
            <CardHeader><CardTitle>Budget vs Spend</CardTitle></CardHeader>
            <CardContent><Bar data={budgetBar} /></CardContent>
          </Card>
        </div>

        {/* Largest expenses list */}
        <Card>
          <CardHeader><CardTitle>Largest expenses this month</CardTitle></CardHeader>
          <CardContent>
            <ul className="divide-y">
              {analytics.largestExpenses.map((e, i) => (
                <li key={i} className="flex justify-between py-2">
                  <span>{e.name || "Unnamed"}</span>
                  <span className="font-medium">${e.amount.toFixed(2)}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
