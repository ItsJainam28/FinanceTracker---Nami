// src/api/analytics.ts
import api from "@/api/axiosInstance";
import {
  AnalyticsSummary,
  BudgetTrackingEntry,
  CumulativeSpendingEntry
} from "@/types/analytics";

export const fetchAnalyticsSummary = () =>
  api.get<AnalyticsSummary>("/analytics/summary");

export const fetchBudgetTracking = () =>
  api.get<BudgetTrackingEntry[]>("/analytics/budget-tracking");

export const fetchCumulativeSpending = () =>
  api.get<CumulativeSpendingEntry[]>("/analytics/cumulative");
