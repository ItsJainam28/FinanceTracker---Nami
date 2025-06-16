// Updated SummaryTiles.tsx - Receives data as props
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, parseISO } from "date-fns";
import { ScheduledSummary, TimezoneAwareDate } from "@/api/scheduledExpense";

const dotColors = [
  "bg-emerald-400",
  "bg-blue-400",
  "bg-yellow-400",
  "bg-purple-400",
  "bg-pink-400",
  "bg-red-400",
];

interface SummaryTilesProps {
  summary: ScheduledSummary | null;
  loading: boolean;
}

export default function SummaryTiles({ summary, loading }: SummaryTilesProps) {

  const formatTriggerDate = (dateField: TimezoneAwareDate | string | null | undefined) => {
    if (!dateField) return "—";
  
    try {
      const rawDate =
        typeof dateField === "string"
          ? dateField
          : dateField.userDate || dateField.utc;
  
      return format(parseISO(rawDate), "MMM d");
    } catch (error) {
      console.error("Error formatting trigger date:", error);
      return "—";
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="bg-background border border-border text-foreground shadow animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
    // Helper function to safely format dates
  
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
            {formatTriggerDate(summary?.nextPaymentDate)}
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
                    {formatTriggerDate(expense.nextTriggerDate)}
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