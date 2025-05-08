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
// src/components/budget/BudgetStatsModal.tsx
// ...imports remain the same...

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

  const [stats, setStats] = useState<Stats>({
    amount: current.amount,
    spent: 0,
    remaining: current.amount,
    percent: 0,
    categoryBreakdown: [],
    historicalData: [],
  });

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(
          `/budgets/${budget._id}/month-summary?month=${current.month}&year=${current.year}`
        );
        setStats(data);
      } catch (err) {
        console.error(err);
        setStats((p) => ({ ...p, spent: 0, remaining: p.amount, percent: 0 }));
      }
    })();
  }, [current.month, current.year, budget._id]);

  const step = (d: -1 | 1) =>
    setIdx((i) => Math.min(Math.max(i + d, 0), timeline.length - 1));
  const prevDisabled = idx === 0;
  const nextDisabled = idx === timeline.length - 1;

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95%] max-w-4xl h-[90vh] max-h-[800px] -translate-x-1/2 -translate-y-1/2 bg-black text-white rounded-xl shadow-xl overflow-hidden flex flex-col border border-white/20">
          <div className="p-6 border-b border-white/10 flex items-center justify-between bg-black">
            <h2 className="text-2xl font-bold">Budget Analysis</h2>
            <div className="text-lg font-medium text-gray-300">
              {monthName(current.month)} {current.year}
            </div>
          </div>
         
          <div className="flex-1 overflow-y-auto p-6">
         
            <Tabs value={activeTab} onValueChange={setActiveTab} border-white>
            <div className="border-white">
            <TabsList className="grid grid-cols-3 mb-6 bg-gray/40 border-white rounded overflow-hidden">
  <TabsTrigger
    value="overview"
    className="data-[state=active]:bg-white data-[state=active]:text-black transition-colors "
  >
    Overview
  </TabsTrigger>
  <TabsTrigger
    value="categories"
    className="data-[state=active]:bg-white data-[state=active]:text-black transition-colors"
  >
    Categories
  </TabsTrigger>
  <TabsTrigger
    value="history"
    className="data-[state=active]:bg-white data-[state=active]:text-black transition-colors"
  >
    History
  </TabsTrigger>
</TabsList>
</div>


              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: "Budgeted", value: stats.amount, color: "border-blue-500" },
                    { title: "Spent", value: stats.spent, color: "border-rose-500" },
                    { title: "Remaining", value: stats.remaining, color: "border-emerald-500" },
                  ].map((item) => (
                    <Card key={item.title} className={`bg-black ${item.color} border-l-4`}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-gray-400">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">
                          {formatCurrency(item.value)}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card className="bg-black">
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
                      className="h-4 bg-white/10"
                      indicatorClassName={
                        stats.percent < 70
                          ? "bg-emerald-500"
                          : stats.percent <= 100
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }
                    />
                    <div className="grid grid-cols-3 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-gray-400">Daily Budget</p>
                        <p className="font-bold">{formatCurrency(stats.amount / 30)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Daily Spent</p>
                        <p className="font-bold">
                          {formatCurrency(stats.spent / Math.max(new Date().getDate(), 1))}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Days Remaining</p>
                        <p className="font-bold">
                          {30 - Math.min(new Date().getDate(), 30)}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="text-sm text-gray-400 border-t pt-4">
                    {stats.percent > 90
                      ? "You're close to your budget limit."
                      : stats.percent > 70
                      ? "You're within budget, but keep an eye on spending."
                      : "You're doing great! Spending is well under budget."}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card className="bg-black">
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
                              {formatCurrency(cat.spent)} / {formatCurrency(cat.amount)}
                            </span>
                          </div>
                          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(pct, 100)}%` }}
                              className={cn(
                                "h-full rounded-full",
                                pct < 70
                                  ? "bg-emerald-500"
                                  : pct <= 100
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card className="bg-black">
                  <CardHeader>
                    <CardTitle>Spending History</CardTitle>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip
                          contentStyle={{ backgroundColor: "#111", border: "1px solid #555", color: "#fff" }}
                          formatter={(v: number) => formatCurrency(v)}
                          labelFormatter={(l) => `Period: ${l}`}
                        />
                        <Bar dataKey="budget" fill="#6b7280" name="Budget" />
                        <Bar dataKey="spent" fill="#3b82f6" name="Spent" />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => step(-1)}
                disabled={prevDisabled}
                className="border-white/20 text-white"
              >
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Prev
              </Button>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant="outline" size="sm" className="border-white/20 text-white">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Choose Month
                  </Button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="bg-black text-white border border-white/20 rounded-md p-4 shadow-md z-60 w-64">
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {timeline.map((b, i) => (
                        <button
                          key={b._id}
                          onClick={() => setIdx(i)}
                          className={cn(
                            "w-full text-left rounded px-3 py-2 hover:bg-white/10",
                            i === idx && "bg-white/10 text-white font-medium"
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
                className="border-white/20 text-white"
              >
                Next <ArrowRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <Dialog.Close asChild>
              <Button className="bg-white text-black">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
