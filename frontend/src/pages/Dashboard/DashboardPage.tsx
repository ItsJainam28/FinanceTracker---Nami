import { useEffect, useState } from "react";
import api from "@/api/axiosInstance";
import { format, subMonths, isThisMonth, isToday } from "date-fns";
import AppSidebar from "@/components/common/AppSidebar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ArrowDown, ArrowUp, CalendarIcon } from "lucide-react";
import { Line } from "react-chartjs-2";
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
  const [userName, setUserName] = useState("User");
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [anaRes, catRes] = await Promise.all([
          api.get("/analytics/summary?period=month"),
          api.get("/categories"),
        ]);
        const ana: Analytics = anaRes.data;
        setAnalytics(ana);
        setCategories(catRes.data);

        const userRes = await api.get("/auth/me");
        setUserName(userRes.data.firstname);

        const mc = ana.monthlyComparison ?? [];
        const thisMonth = mc.find((m) => isThisMonth(new Date(m.month))) ?? {
          month: format(new Date(), "MMM yyyy"),
          expenses: 0,
        };
        const lastMonth =
          mc.find((m) => new Date(m.month).getMonth() === subMonths(new Date(), 1).getMonth()) ?? { expenses: 0 };
        const monthlyChange =
          lastMonth.expenses > 0 ? ((thisMonth.expenses - lastMonth.expenses) / lastMonth.expenses) * 100 : 0;
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
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading…</div>;
  }

  const todaySpending = analytics.dailyTrend.find((d) => isToday(new Date(d._id)))?.total || 0;
  const categoryMap = Object.fromEntries(categories.map((c) => [c._id, c.name]));

  const spendingOverTime = {
    labels: analytics.dailyTrend.map((d) => d._id),
    datasets: [
      {
        label: "Daily Spending",
        data: analytics.dailyTrend.map((d) => d.total),
        fill: true,
        backgroundColor: "rgba(255,255,255,0.1)",
        borderColor: "#ffffff",
        tension: 0.3,
      },
    ],
  };

  const topExpenses = analytics.largestExpenses.slice(0, 5);

  return (
    <div className="flex-1 min-h-screen bg-black text-white">
      <main className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 overflow-auto">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold text-white">Hello, {userName}</h1>
          {todaySpending > 0 && (
            <Card className="bg-black border border-white/20">
              <CardContent className="pt-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-400">Today's Spending</p>
                    <p className="text-2xl font-bold text-white">${todaySpending.toFixed(2)}</p>
                  </div>
                  <CalendarIcon className="text-white" size={24} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <Card className="bg-black-900 border border-white/20">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg text-white">Expenses: {summary.currentMonth}</CardTitle>
              <CalendarIcon className="text-white" size={18} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Total Expenses</p>
                <p className="text-2xl font-bold text-white">${summary.totalExpenses.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Change vs Last Month</p>
                <p
                  className={`flex items-center text-lg font-medium ${
                    summary.monthlyChange <= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  {summary.monthlyChange <= 0 ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
                  {Math.abs(summary.monthlyChange).toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Monthly Insights</CardTitle>
            <CardDescription className="text-gray-400">Explore your spending patterns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="pt-4 space-y-4">
              {analytics.topCategories.length ? (
                analytics.topCategories.map((cat) => {
                  const percentage = analytics.totalSpending > 0 ? (cat.total / analytics.totalSpending) * 100 : 0;
                  return (
                    <div key={cat._id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{categoryMap[cat._id] || "Uncategorized"}</span>
                        <span>${cat.total.toFixed(2)} ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2.5">
                        <div
                          className="bg-white h-2.5 rounded-full"
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p className="text-gray-400">No category spending recorded</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black border border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Top 5 Largest Expenses</CardTitle>
            <CardDescription className="text-gray-400">This month</CardDescription>
          </CardHeader>
          <CardContent>
            {topExpenses.length ? (
              <ul className="divide-y divide-white/10">
                {topExpenses.map((e, i) => (
                  <li key={i} className="flex justify-between py-3">
                    <div>
                      <p className="font-medium text-white">{e.name || "Unnamed"}</p>
                      <p className="text-sm text-gray-400">
                        {e.date} • {categoryMap[e.categoryId] || "Uncategorized"}
                      </p>
                    </div>
                    <span className="font-medium text-white">${e.amount.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No expenses recorded this month</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}