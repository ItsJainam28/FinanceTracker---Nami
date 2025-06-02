import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { 
  getScheduledSummary, 
  ScheduledSummary, 
  getUserTimezone,
  formatScheduledExpenseDate 
} from "@/api/scheduledExpense";

const dotColors = [
  "bg-emerald-400",
  "bg-blue-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-red-400",
];

export default function SummaryTiles() {
  const [summary, setSummary] = useState<ScheduledSummary | null>(null);
  const userTimezone = getUserTimezone();

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await getScheduledSummary(userTimezone);
        setSummary(res.data);
      } catch (err) {
        console.error("Failed to load scheduled summary:", err);
      }
    };

    fetchSummary();
  }, [userTimezone]);

  // Helper function to safely format dates
  const formatDate = (dateField: any, formatString: string = "MMM d") => {
    if (!dateField) return "—";
    
    try {
      if (typeof dateField === 'string') {
        return format(new Date(dateField), formatString);
      } else if (dateField.userDate || dateField.utc) {
        // Handle TimezoneAwareDate format
        const dateToUse = dateField.userDate || dateField.utc;
        return format(new Date(dateToUse), formatString);
      }
      return "—";
    } catch (error) {
      console.error("Error formatting date:", error);
      return "—";
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* 💸 Total Recurring */}
      <Card className="bg-background border border-border text-foreground shadow">
        <CardHeader>
          <CardTitle className="text-md text-muted-foreground">
            Total Recurring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            ${summary?.totalMonthlySpend.toFixed(2) ?? "0.00"}
          </p>
        </CardContent>
      </Card>

      {/* ⏰ Next Payment */}
      <Card className="bg-background border border-border text-foreground shadow">
        <CardHeader>
          <CardTitle className="text-md text-muted-foreground">
            Next Payment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg font-semibold">
            {summary?.nextPaymentName || "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            {formatDate(summary?.nextPaymentDate)}
          </p>
        </CardContent>
      </Card>

      {/* 📋 Upcoming List */}
      <Card className="bg-background border border-border text-foreground shadow overflow-hidden">
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
                    {formatDate(expense.nextTriggerDate)}
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