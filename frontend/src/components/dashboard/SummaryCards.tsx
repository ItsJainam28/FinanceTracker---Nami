import { AnalyticsSummary } from "@/types/analytics";
import { ArrowDown, ArrowUp, CalendarIcon } from "lucide-react";
import { format, isToday, parseISO } from "date-fns";

interface Props {
  data: AnalyticsSummary;
}

export default function SummaryCards({ data }: Props) {
  const today = format(new Date(), "yyyy-MM-dd");

  const todaySpent =
    data.dailyTrend.find((entry) => entry._id === today)?.total || 0;

  const lastTwoMonths = [...data.monthlyComparison].slice(-2);
  const [prevMonth, currentMonth] = lastTwoMonths;

  const percentChange =
    prevMonth && prevMonth.expenses > 0
      ? ((currentMonth.expenses - prevMonth.expenses) / prevMonth.expenses) * 100
      : 0;

  const changeDirection = percentChange >= 0 ? "up" : "down";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      {/* Total Spent */}
      <div className="bg-black border border-white/20 rounded-lg p-4">
        <p className="text-sm text-gray-400">Total Spent This Month</p>
        <p className="text-2xl font-bold text-white">${data.totalSpending.toFixed(2)}</p>
      </div>

      {/* Month-over-Month Change */}
      <div className="bg-black border border-white/20 rounded-lg p-4">
        <p className="text-sm text-gray-400">Change from Last Month</p>
        <p
          className={`flex items-center text-xl font-semibold ${
            changeDirection === "down" ? "text-green-400" : "text-red-400"
          }`}
        >
          {changeDirection === "down" ? <ArrowDown size={20} /> : <ArrowUp size={20} />}
          {Math.abs(percentChange).toFixed(1)}%
        </p>
      </div>

      {/* Today's Spending */}
      <div className="bg-black border border-white/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-400">Today's Spending</p>
          <CalendarIcon size={18} className="text-white" />
        </div>
        <p className="text-2xl font-bold text-white mt-1">${todaySpent.toFixed(2)}</p>
      </div>
    </div>
  );
}
