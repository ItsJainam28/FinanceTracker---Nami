import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ArrowLeftIcon, ArrowRightIcon, CalendarIcon, PieChartIcon, BarChartIcon, TrendingUpIcon } from "lucide-react";
import api from "@/api/axiosInstance";
import { cn } from "@/lib/utils";

/* ───────── Types ───────── */
interface Budget {
  _id: string;
  month: number;
  year: number;
  amount: number;
  categories: string[];
}

interface Stats {
  amount: number;
  spent: number;
  remaining: number;
  percent: number;
  categoryBreakdown: { name: string; amount: number; spent: number }[];
  historicalData: { month: string; spent: number; budget: number }[];
}

interface Props {
  open: boolean;
  onClose: () => void;
  budget: Budget;
  timeline: Budget[]; // chronological
}

const monthName = (m: number) =>
  new Date(0, m - 1).toLocaleString("default", { month: "long" });

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

/* ───────── Component ───────── */
export default function BudgetStatsModal({
  open,
  onClose,
  budget,
  timeline,
}: Props) {
  const [idx, setIdx] = useState(
    Math.max(0, timeline.findIndex((b) => b._id === budget._id))
  );
  const current = timeline[idx] || budget;
  const [activeTab, setActiveTab] = useState("overview");

  /* Default stats while loading */
  const [stats, setStats] = useState<Stats>({
    amount: current.amount,
    spent: 0,
    remaining: current.amount,
    percent: 0,
    categoryBreakdown: [],
    historicalData: [],
  });

  /* Fetch live stats */
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(
          `/budgets/${budget._id}/month-summary?month=${current.month}&year=${current.year}`
        );
        setStats(data); // <-- live backend payload
      } catch (err) {
        console.error(err);
        setStats((p) => ({ ...p, spent: 0, remaining: p.amount, percent: 0 }));
      }
    })();
  }, [current.month, current.year, budget._id]);

  /* Nav helpers */
  const step = (d: -1 | 1) =>
    setIdx((i) => Math.min(Math.max(i + d, 0), timeline.length - 1));
  const prevDisabled = idx === 0;
  const nextDisabled = idx === timeline.length - 1;

  /* ───────── UI ───────── */
  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95%] max-w-4xl h-[90vh] max-h-[800px] -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="p-6 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
            <h2 className="text-2xl font-bold text-gray-800">
              Budget Analysis
            </h2>
            <div className="text-lg font-medium text-gray-700">
              {monthName(current.month)} {current.year}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6">
                <TabsTrigger value="overview">
                  <PieChartIcon className="h-4 w-4 mr-1" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="categories">
                  <BarChartIcon className="h-4 w-4 mr-1" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="history">
                  <TrendingUpIcon className="h-4 w-4 mr-1" />
                  History
                </TabsTrigger>
              </TabsList>

              {/* Overview */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    {
                      title: "Budgeted",
                      color: "blue-500",
                      value: stats.amount,
                    },
                    { title: "Spent", color: "rose-500", value: stats.spent },
                    {
                      title: "Remaining",
                      color: "emerald-500",
                      value: stats.remaining,
                    },
                  ].map((c) => (
                    <Card
                      key={c.title}
                      className={`border-l-4 border-l-${c.color}`}
                    >
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-500">
                          {c.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p
                          className={cn(
                            "text-3xl font-bold",
                            c.title === "Spent" && "text-rose-600",
                            c.title === "Remaining" && "text-emerald-600"
                          )}
                        >
                          {formatCurrency(c.value)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Budget Usage</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress</span>
                      <span>{stats.percent.toFixed(1)}% used</span>
                    </div>
                    <Progress
                      value={stats.percent}
                      className="h-4 bg-gray-100 rounded-full"
                      indicatorClassName={
                        stats.percent < 70
                          ? "bg-emerald-500"
                          : stats.percent <= 100
                          ? "bg-amber-500"
                          : "bg-rose-600"
                      }
                    />

                    {/* Quick metrics */}
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div className="metric">
                        <p className="text-sm text-gray-500">Daily Budget</p>
                        <p className="font-bold">
                          {formatCurrency(stats.amount / 30)}
                        </p>
                      </div>
                      <div className="metric">
                        <p className="text-sm text-gray-500">Daily Spent</p>
                        <p className="font-bold">
                          {formatCurrency(
                            stats.spent / Math.max(new Date().getDate(), 1)
                          )}
                        </p>
                      </div>
                      <div className="metric">
                        <p className="text-sm text-gray-500">
                          Days Remaining
                        </p>
                        <p className="font-bold">
                          {30 - Math.min(new Date().getDate(), 30)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-500 border-t pt-4">
                    {stats.percent > 90
                      ? "You're close to your budget limit."
                      : stats.percent > 70
                      ? "Your spending is within budget but monitor your expenses."
                      : "You're doing great! Spending is well under budget."}
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Categories */}
              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Category Breakdown</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {stats.categoryBreakdown.map((cat) => {
                      const pct = (cat.spent / cat.amount) * 100;
                      return (
                        <div key={cat.name} className="mb-4 space-y-2">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{cat.name}</span>
                            <span>
                              {formatCurrency(cat.spent)} /{" "}
                              {formatCurrency(cat.amount)}
                            </span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(pct, 100)}%` }}
                              className={cn(
                                "h-full rounded-full",
                                pct < 70
                                  ? "bg-emerald-500"
                                  : pct <= 100
                                  ? "bg-amber-500"
                                  : "bg-rose-600"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* History */}
              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Spending History</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={stats.historicalData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip
                          formatter={(v: number) => formatCurrency(v)}
                          labelFormatter={(l) => `Period: ${l}`}
                        />
                        <Bar dataKey="budget" fill="#94a3b8" name="Budget" />
                        <Bar dataKey="spent"  fill="#3b82f6" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Footer Nav + Close */}
          <div className="p-4 border-t flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => step(-1)}
                disabled={prevDisabled}
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Prev
              </Button>

              {/* Month quick picker */}
              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Choose Month
                  </Button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="bg-white border rounded-md p-4 shadow-md z-60 w-64">
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {timeline.map((b, i) => (
                        <button
                          key={b._id}
                          onClick={() => setIdx(i)}
                          className={cn(
                            "w-full text-left rounded px-3 py-2 hover:bg-gray-100",
                            i === idx && "bg-blue-100 text-blue-700 font-medium"
                          )}
                        >
                          {monthName(b.month)} {b.year}
                        </button>
                      ))}
                    </div>
                    <Popover.Close />
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>

              <Button
                variant="outline"
                size="sm"
                onClick={() => step(1)}
                disabled={nextDisabled}
              >
                Next <ArrowRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <Dialog.Close asChild>
              <Button>Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
