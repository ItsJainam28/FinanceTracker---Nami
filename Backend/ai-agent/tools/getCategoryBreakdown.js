import { tool } from "@langchain/core/tools";
import { z } from "zod";
import Expense from "../../models/expense.js";
import Category from "../../models/category.js";

export const getCategoryBreakdown = tool(
  async ({ startDate, endDate, userId }) => {
    console.log("🔎 getCategoryBreakdown called with:", { startDate, endDate, userId });
    const data = await Expense.aggregate([
      {
        $match: {
          userId,
          date: { $gte: new Date(startDate), $lte: new Date(endDate) },
        },
      },
      {
        $group: { _id: "$categoryId", total: { $sum: "$amount" } },
      },
    ]);

    if (!data.length) {
      return `No expenses found between ${startDate} and ${endDate}.`;
    }

    const ids = data.map((d) => d._id);
    const cats = await Category.find({ _id: { $in: ids } });
    const nameMap = {};
    cats.forEach((c) => (nameMap[c._id.toString()] = c.name));

    let resp = `Category breakdown from ${startDate} to ${endDate}:\n`;
    for (const { _id, total } of data) {
      const name = nameMap[_id.toString()] || "Uncategorized";
      resp += `• ${name}: $${total.toFixed(2)}\n`;
    }
    return resp;
  },
  {
    name: "get_category_breakdown",
    description: "Returns category-wise spending totals between two dates",
    schema: z.object({
      startDate: z.string().describe("Start date in YYYY-MM-DD format"),
      endDate: z.string().describe("End date in YYYY-MM-DD format"),
      userId: z.string().describe("User ID for authentication"), // injected
    }),
  }
);
