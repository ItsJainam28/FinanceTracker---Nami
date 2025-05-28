// tools/getSpendingTrend.js
import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Expense from "../../models/expense.js";

export const getSpendingTrend = tool(
  async ({ startDate, endDate, interval, category, userId }) => {
    console.log("🔎 getSpendingTrend called with:", { startDate, endDate, userId });
    const match = {
      userId,
      date: { $gte: new Date(startDate), $lte: new Date(endDate) },
    };
    if (category) match.categoryName = category;

    let fmt;
    switch (interval) {
      case "daily": fmt = "%Y-%m-%d"; break;
      case "weekly": fmt = "%Y-%U"; break;
      case "monthly": fmt = "%Y-%m"; break;
      default: return "Invalid interval. Use 'daily', 'weekly', or 'monthly'.";
    }

    const results = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: fmt, date: "$date" } },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    if (!results.length) {
      return `No data found from ${startDate} to ${endDate}.`;
    }

    let resp = `Spending trend (${interval}) from ${startDate} to ${endDate}${
      category ? ` in ${category}` : ""
    }:\n`;
    results.forEach((pt) => {
      resp += `• ${pt._id}: $${pt.total.toFixed(2)}\n`;
    });
    return resp;
  },
  {
    name: "get_spending_trend",
    description: "Returns time-series spending totals by day, week, or month (optional category)",
    schema: z.object({
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format"),
      interval: z.enum(["daily", "weekly", "monthly"]),
      category: z.string().optional(),
      userId: z.string().describe("User ID for authentication"), // injected
    }),
  }
);
