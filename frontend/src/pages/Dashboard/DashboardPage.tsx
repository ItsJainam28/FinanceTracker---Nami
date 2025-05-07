/* src/pages/DashboardPage.tsx */
import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import Navbar from "@/components/common/Navbar";
import { format, subMonths, isThisMonth, isToday } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, CalendarIcon } from "lucide-react";
import { Line, Pie } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

interface Analytics {
  totalSpending: number;
  topCategories: { _id: string; total: number }[];
  dailyTrend: { _id: string; total: number }[];
  largestExpenses: { name: string; amount: number; date: string; categoryId: string }[];
  monthlyComparison: { month: string; expenses: number }[];
}
interface Category {
  _id: string;
  name: string;
}

interface Summary {
  currentMonth: string;
  totalExpenses: number;
  monthlyChange: number;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [userName, setUserName] = useState("User"); // Placeholder
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
             // Fetch analytics and categories
             const [anaRes, catRes] = await Promise.all([
              api.get("/analytics/summary?period=month"),
              api.get("/categories"),
            ]);
        const ana: Analytics = anaRes.data;
        setAnalytics(ana);
        setCategories(catRes.data);


     
        const userRes = await api.get("/auth/me");

        setUserName(userRes.data.firstname);

        // Monthly summary
        const mc = ana.monthlyComparison ?? [];
        const thisMonth = mc.find((m) => isThisMonth(new Date(m.month))) ?? {
          month: format(new Date(), "MMM yyyy"),
          expenses: 0,
        };
        const lastMonth = mc.find(
          (m) => new Date(m.month).getMonth() === subMonths(new Date(), 1).getMonth()
        ) ?? { expenses: 0 };
        const monthlyChange =
          lastMonth.expenses > 0
            ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100
            : 0;
        setSummary({
          currentMonth: format(new Date(), "MMMM yyyy"),
          totalExpenses: ana.totalSpending,
          monthlyChange,
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading || !analytics || !summary) {
    return <div className="min-h-screen flex items-center justify-center">Loading…</div>;
  }

  // Today's spending
  const todaySpending = analytics.dailyTrend.find((d) =>
    isToday(new Date(d._id))
  )?.total || 0;

   // Category ID to name mapping

   const categoryMap = Object.fromEntries(
    categories.map((c) => [c._id, c.name])
  );


  // Chart data
  const spendingOverTime = {
    labels: analytics.dailyTrend.map((d) => d._id),
    datasets: [
      {
        label: "Daily Spending",
        data: analytics.dailyTrend.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(14,165,233,0.15)",
        borderColor: "#0ea5e9",
        tension: 0.3,
      },
    ],
  };

  const categoryPie = {
    labels: analytics.topCategories.map((c) => categoryMap[c._id] || "Uncategorized"),
    datasets: [
      {
        data: analytics.topCategories.map((c) => c.total),
        backgroundColor: ["#f87171", "#fb923c", "#facc15", "#4ade80", "#38bdf8", "#a78bfa", "#f472b6"],
      },
    ],
  };

  // Top 5 largest expenses
  console.log(analytics.largestExpenses);
  const topExpenses = analytics.largestExpenses.slice(0, 5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <Navbar />
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header: Greeting and Today's Stats */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Hello, {userName}
          </h1>
          {todaySpending > 0 && (
            <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Today's Spending</p>
                    <p className="text-2xl font-bold text-red-600">${todaySpending.toFixed(2)}</p>
                  </div>
                  <CalendarIcon className="text-blue-500" size={24} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Monthly Expenses Card */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg">Expenses: {summary.currentMonth}</CardTitle>
              <CalendarIcon className="text-blue-500" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Total Expenses</p>
                <p className="text-2xl font-bold text-red-600">${summary.totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Change vs Last Month</p>
                <p
                  className={`flex items-center text-lg font-medium ${
                    summary.monthlyChange <= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {summary.monthlyChange <= 0 ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                  {Math.abs(summary.monthlyChange).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabbed Charts Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle>Monthly Insights</CardTitle>
            <CardDescription>Explore your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="spending" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="spending">Spending Over Time</TabsTrigger>
                <TabsTrigger value="categories">Categories</TabsTrigger>
              </TabsList>
              <TabsContent value="spending">
                <div className="pt-4">
                  <Line data={spendingOverTime} options={{ maintainAspectRatio: false }} />
                </div>
              </TabsContent>
              <TabsContent value="categories">
                <div className="pt-4">
                  <Pie data={categoryPie} options={{ maintainAspectRatio: false }} />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Largest Expenses Card */}
        <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
          <CardHeader>
            <CardTitle>Top 5 Largest Expenses</CardTitle>
            <CardDescription>This month</CardDescription>
          </CardHeader>
          <CardContent>
            {topExpenses.length ? (
              <ul className="divide-y divide-gray-200">
                {topExpenses.map((e, i) => (
                  <li key={i} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium text-gray-900">{e.name || "Unnamed"}</p>
                      <p className="text-sm text-gray-500">
                        {e.date} • {categoryMap[e.categoryId] || "Uncategorized"}
                      </p>
                    </div>
                    <span className="font-medium text-red-600">${e.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No expenses recorded this month</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}