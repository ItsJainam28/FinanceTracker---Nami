import { tool } from "@langchain/core/tools";
import { resolveNaturalDateRange } from "./resolveNaturalDateRange.js";
import { getSpendingSummary } from "./getSpendingSummary.js";
import { getCategoryBreakdown } from "./getCategoryBreakdown.js";
import { getSpendingTrend } from "./getSpendingTrend.js";

export function createToolsForUser(userId) {
  return [
    resolveNaturalDateRange,

    tool(
      async (input) => {
        return await getSpendingSummary.func({ ...input, userId });
      },
      {
        ...getSpendingSummary,
      }
    ),

    tool(
      async (input) => {
        return await getCategoryBreakdown.func({ ...input, userId });
      },
      {
        ...getCategoryBreakdown,
      }
    ),

    tool(
      async (input) => {
        return await getSpendingTrend.func({ ...input, userId });
      },
      {
        ...getSpendingTrend,
      }
    ),
  ];
}
