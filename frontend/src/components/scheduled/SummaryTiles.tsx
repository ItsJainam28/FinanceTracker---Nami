import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { getScheduledSummary, ScheduledSummary } from "@/api/scheduledExpense";

const dotColors = [
  "bg-green-500",
  "bg-blue-500",
  "bg-yellow-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-red-500",
];

export default function SummaryTiles() {
  const [summary, setSummary] = useState<ScheduledSummary | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getScheduledSummary();
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load scheduled summary:", err);
      }
    };

    fetchSummary();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* 💸 Total Monthly Spend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md text-muted-foreground">Total Recurring</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${summary?.totalMonthlySpend.toFixed(2)}</p>
        </CardContent>
      </Card>

      {/* ⏰ Next Payment */}
      <Card>
        <CardHeader>
          <CardTitle className="text-md text-muted-foreground">Next Payment</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">{summary?.nextPaymentName || "—"}</p>
          <p className="text-sm text-muted-foreground">
            {summary?.nextPaymentDate
              ? format(new Date(summary.nextPaymentDate), "MMM d")
              : "—"}
          </p>
        </CardContent>
      </Card>

      {/* 📋 Upcoming List (with count) */}
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="text-md text-muted-foreground">
            Upcoming Payments
            {summary?.upcomingCount ? ` (${summary.upcomingCount})` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="max-h-[180px] overflow-y-auto pr-1 space-y-2 custom-scroll">
          {summary?.upcomingList.length ? (
            summary.upcomingList.map((expense, i) => (
              <div
                key={expense._id}
                className="flex items-center gap-3 text-sm p-1 rounded hover:bg-muted transition"
              >
                <div className={`w-2.5 h-2.5 rounded-full ${dotColors[i % dotColors.length]}`} />
                <div className="flex flex-col">
                  <span className="font-medium">{expense.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(expense.nextTriggerDate), "MMM d")}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming payments.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
