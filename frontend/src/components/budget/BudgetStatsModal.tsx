// src/components/budget/BudgetStatsModal.tsx
import { useEffect, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  CalendarIcon,
  PieChartIcon,
  BarChartIcon,
  TrendingUpIcon,
} from "lucide-react";
import api from "@/api/axiosInstance";
import { cn } from "@/lib/utils";

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
  recurringId: string;
}

const monthName = (m: number) =>
  new Date(0, m - 1).toLocaleString("default", { month: "long" });

const formatCurrency = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(n);

export default function BudgetStatsModal({ open, onClose, recurringId }: Props) {
  const [timeline, setTimeline] = useState<Budget[]>([]);
  const [idx, setIdx] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState<Stats>({
    amount: 0,
    spent: 0,
    remaining: 0,
    percent: 0,
    categoryBreakdown: [],
    historicalData: [],
  });

  useEffect(() => {
    if (!recurringId) return;
    api
      .get<Budget[]>(`/budgets/recurring/${recurringId}/timeline`)
      .then((res) => {
        const sorted = res.data.sort((a, b) => a.year - b.year || a.month - b.month);
        setTimeline(sorted);
        const now = new Date();
        const found = sorted.findIndex(
          (b) => b.month === now.getMonth() + 1 && b.year === now.getFullYear()
        );
        setIdx(found >= 0 ? found : sorted.length - 1);
      })
      .catch(console.error);
  }, [recurringId]);

  const current = timeline[idx];

  useEffect(() => {
    if (!current) return;
    api
      .get<Stats>(
        `/budgets/${current._id}/month-summary?month=${current.month}&year=${current.year}`
      )
      .then((res) => setStats(res.data))
      .catch(() =>
        setStats((prev) => ({
          ...prev,
          amount: current.amount,
          spent: 0,
          remaining: current.amount,
          percent: 0,
        }))
      );
  }, [current]);

  const step = (delta: -1 | 1) =>
    setIdx((i) => Math.min(Math.max(i + delta, 0), timeline.length - 1));

  return (
    <Dialog.Root open={open} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-1/2 left-1/2 w-[95%] max-w-4xl h-[90vh] max-h-[800px] -translate-x-1/2 -translate-y-1/2 bg-card text-card-foreground rounded-xl shadow-xl overflow-hidden flex flex-col border border-border">
          <div className="p-6 border-b border-border flex items-center justify-between">
            <h2 className="text-2xl font-bold">Budget Analysis</h2>
            {current && <div className="text-lg text-muted-foreground">{monthName(current.month)} {current.year}</div>}
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid grid-cols-3 mb-6 bg-muted rounded overflow-hidden">
                <TabsTrigger value="overview" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <PieChartIcon className="mr-1 h-4 w-4" /> Overview
                </TabsTrigger>
                <TabsTrigger value="categories" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <BarChartIcon className="mr-1 h-4 w-4" /> Categories
                </TabsTrigger>
                <TabsTrigger value="history" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <TrendingUpIcon className="mr-1 h-4 w-4" /> History
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { title: "Budgeted", value: stats.amount },
                    { title: "Spent", value: stats.spent },
                    { title: "Remaining", value: stats.remaining },
                  ].map((item) => (
                    <Card key={item.title} className="bg-card border-l-4 border-border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm text-muted-foreground">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-3xl font-bold">{formatCurrency(item.value)}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <Card>
                  <CardHeader><CardTitle>Budget Usage</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                      <span>Progress</span>
                      <span>{stats.percent.toFixed(1)}% used</span>
                    </div>
                    <Progress
                      value={stats.percent}
                      className="h-4 bg-muted/40"
                      indicatorClassName={cn(
                        stats.percent < 70
                          ? "bg-green-500"
                          : stats.percent <= 100
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      )}
                    />
                  </CardContent>
                  <CardFooter className="text-sm text-muted-foreground border-t pt-4">
                    {stats.percent > 90
                      ? "You're close to your budget limit."
                      : stats.percent > 70
                      ? "You're within budget, but keep an eye on spending."
                      : "You're doing great! Spending is well under budget."}
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="categories" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Category Breakdown</CardTitle></CardHeader>
                  <CardContent>
                    {stats.categoryBreakdown.map((cat) => {
                      const pct = (cat.spent / cat.amount) * 100;
                      return (
                        <div key={cat.name} className="mb-4">
                          <div className="flex justify-between text-sm font-medium">
                            <span>{cat.name}</span>
                            <span>{formatCurrency(cat.spent)} / {formatCurrency(cat.amount)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                pct < 70
                                  ? "bg-green-500"
                                  : pct <= 100
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              )}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="history" className="space-y-6">
                <Card>
                  <CardHeader><CardTitle>Spending History</CardTitle></CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.historicalData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                        <XAxis dataKey="month" stroke="#aaa" />
                        <YAxis stroke="#aaa" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "#111",
                            border: "1px solid #555",
                            color: "#fff",
                          }}
                          formatter={(v: number) => formatCurrency(v)}
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

          <div className="p-4 border-t border-border flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => step(-1)} disabled={idx === 0}>
                <ArrowLeftIcon className="h-3 w-3 mr-1" />
                Prev
              </Button>

              <Popover.Root>
                <Popover.Trigger asChild>
                  <Button variant="outline" size="sm">
                    <CalendarIcon className="h-3 w-3 mr-1" />
                    Choose Month
                  </Button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content className="bg-card text-card-foreground border border-border rounded-md p-4 shadow-md z-60 w-64">
                    <div className="space-y-1 max-h-64 overflow-y-auto">
                      {timeline.map((b, i) => (
                        <button
                          key={b._id}
                          onClick={() => setIdx(i)}
                          className={cn(
                            "block w-full text-left px-3 py-2 rounded hover:bg-muted",
                            i === idx && "bg-muted text-foreground font-medium"
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

              <Button variant="outline" size="sm" onClick={() => step(1)} disabled={idx === timeline.length - 1}>
                Next <ArrowRightIcon className="h-3 w-3 ml-1" />
              </Button>
            </div>

            <Dialog.Close asChild>
              <Button className="bg-primary text-primary-foreground">Close</Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
