import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { ChatOpenAI } from "@langchain/openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const dateModel = new ChatOpenAI({
  temperature: 0,
  modelName: "gpt-3.5-turbo",
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// AI-based resolver
async function aiResolveDateRange(phrase, refDate = new Date()) {
  const iso = refDate.toISOString().split("T")[0];
  const dow = refDate.toLocaleDateString("en-US", { weekday: "long" });
  const prompt = `
Today is ${dow}, ${iso}.
Convert this phrase to JSON: { "startDate": "...", "endDate": "..." } for "${phrase}"
Return ONLY the JSON.`;
  const res = await dateModel.invoke(prompt);
  const m = res.content.match(/\{[\s\S]*\}/);
  if (!m) throw new Error("No JSON in model response");
  return JSON.parse(m[0]);
}

// Fallback via chrono-node
function fallbackChronoResolve(phrase, refDate = new Date()) {
  try {
    const chrono = require("chrono-node");
    const parsed = chrono.parse(phrase, refDate);
    if (!parsed.length) return null;
    const { start, end } = parsed[0];
    const s = start.date(), e = end ? end.date() : new Date(s);
    return {
      startDate: s.toISOString().split("T")[0],
      endDate: e.toISOString().split("T")[0],
    };
  } catch {
    return null;
  }
}

export const resolveNaturalDateRange = tool(
  async ({ phrase }) => {
    let result = null;
    try {
      result = await aiResolveDateRange(phrase);
    } catch {
      result = fallbackChronoResolve(phrase);
    }
    if (!result) {
      throw new Error(`Could not parse date phrase "${phrase}"`);
    }
    return JSON.stringify({
      startDate: result.startDate,
      endDate: result.endDate,
      originalPhrase: phrase,
      parsedRange: `${result.startDate} to ${result.endDate}`,
    });
  },
  {
    name: "resolve_natural_date_range",
    description: "Converts any natural language date phrase into ISO startDate/endDate",
    schema: z.object({
      phrase: z.string().describe("Natural language date phrase (e.g. 'last month', 'Q1 2024', 'past 30 days')"),
    }),
  }
);