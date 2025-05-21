import api from "./axiosInstance"; // your axios base config
import { AxiosResponse } from "axios";

export interface ScheduledExpense {
  _id: string;
  name: string;
  amount: number;
  categoryId: string | null;
  budgetId?: string | null;
  startDate: string;
  endDate?: string | null;
  frequency: "monthly";
  nextTriggerDate: string;
  isActive: boolean;
}

export interface ScheduledSummary {
  totalMonthlySpend: number;
  nextPaymentName: string | null;
  nextPaymentDate: string | null;
  upcomingCount: number;
  upcomingList: {
    _id: string;
    name: string;
    nextTriggerDate: string;
  }[];
}

// 🔄 GET all recurring expenses (with optional filters)
export const getScheduledExpenses = (
  status?: "all" | "active" | "paused",
  categoryId?: string | null
): Promise<AxiosResponse<ScheduledExpense[]>> => {
  const params: any = {};
  if (status && status !== "all") params.status = status;
  if (categoryId) params.categoryId = categoryId;

  return api.get("/recurring-expenses", { params });
};


// ➕ Create new scheduled expense
export const createScheduledExpense = (
  payload: Partial<ScheduledExpense> & { logIfPast?: boolean }
): Promise<AxiosResponse<ScheduledExpense>> => {
  return api.post("/recurring-expenses", payload);
};

// 🖊️ Update allowed fields of a scheduled expense
export const updateScheduledExpense = (
  id: string,
  payload: Partial<Pick<ScheduledExpense, "name" | "amount" | "endDate" | "isActive">>
): Promise<AxiosResponse<ScheduledExpense>> => {
  return api.patch(`/recurring-expenses/${id}`, payload);
};

// ❌ Delete scheduled expense
export const deleteScheduledExpense = (
  id: string
): Promise<AxiosResponse<{ message: string }>> => {
  return api.delete(`/recurring-expenses/${id}`);
};

// 🔁 Toggle active status
export const toggleScheduledExpense = (
  id: string
): Promise<AxiosResponse<{ isActive: boolean }>> => {
  return api.patch(`/recurring-expenses/${id}/toggle`);
};

// 📊 Get summary data
export const getScheduledSummary = (): Promise<AxiosResponse<ScheduledSummary>> => {
  return api.get("/recurring-expenses/summary");

};
