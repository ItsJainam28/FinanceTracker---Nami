import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Expense from "../../models/expense.js";
import Category from "../../models/category.js";

export const getSpendingSummary = tool(
  async ({ startDate, endDate, category, userId }) => {
    console.log("🔎 getSpendingSummary called with:", { startDate, endDate, userId });
    const match = {
      userId,
      date: {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      },
    };

    console.log(
      `🔍 Fetching spending summary for user ${userId} from ${startDate} to ${endDate}${
        category ? ` in category "${category}"` : ""
      }`
    );

    if (category) {
      const catDoc = await Category.findOne({
        name: new RegExp(`^${category}$`, "i"),
      });
      if (!catDoc) {
        return `No category found with name "${category}".`;
      }
      match.categoryId = catDoc._id;
    }

    const [res] = await Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: "$amount" } } },
    ]);

    const total = (res?.total || 0).toFixed(2);
    return `You spent $${total}${
      category ? ` on ${category}` : ""
    } between ${startDate} and ${endDate}.`;
  },
  {
    name: "get_spending_summary",
    description: "Returns total spending between two ISO dates, optionally filtered by category",
    schema: z.object({
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format"),
      category: z.string().optional().describe("Optional category name"),
      userId: z.string().describe("User ID for authentication"), // injected
    }),
  }
);
