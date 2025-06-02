import api from "./axiosInstance"; // your axios base config
import { AxiosResponse } from "axios";

// Enhanced date object with timezone information
export interface TimezoneAwareDate {
  utc: string;
  userDate: string;
  userDateTime: string;
  userTimezone: string;
}

export interface ScheduledExpense {
  _id: string;
  name: string;
  amount: number;
  categoryId: string | null;
  budgetId?: string | null;
  startDate: TimezoneAwareDate | string; // Can be either format for backward compatibility
  endDate?: TimezoneAwareDate | string | null;
  frequency: "monthly";
  nextTriggerDate: TimezoneAwareDate ;
  isActive: boolean;
  userTimezone?: string | null;
}

export interface ScheduledSummary {
  totalMonthlySpend: number;
  nextPaymentName: string | null;
  nextPaymentDate: TimezoneAwareDate | string | null;
  upcomingCount: number;
  upcomingList: {
    _id: string;
    name: string;
    amount: number;
    nextTriggerDate: TimezoneAwareDate | string;
  }[];
  userTimezone: string;
  todayInUserTimezone: TimezoneAwareDate;
}

// Helper function to get user's timezone as fallback
export const getUserTimezone = (): string => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (error) {
    console.warn("Could not detect user timezone, defaulting to UTC:", error);
    return 'UTC';
  }
};

// Helper function to add timezone to request config
const addTimezoneToConfig = (userTimezone: string, config: any = {}) => {
  // Add timezone as query parameter
  const params = { ...config.params, timezone: userTimezone };
  
  // Add timezone as header (backup method)
  const headers = { 
    ...config.headers, 
    'X-User-Timezone': userTimezone 
  };
  
  return { ...config, params, headers };
};

// 🔄 GET all recurring expenses (with optional filters)
export const getScheduledExpenses = (
  userTimezone: string,
  status?: "all" | "active" | "paused",
  categoryId?: string | null
): Promise<AxiosResponse<ScheduledExpense[]>> => {
  const params: any = {};
  if (status && status !== "all") params.status = status;
  if (categoryId) params.categoryId = categoryId;

  const config = addTimezoneToConfig(userTimezone, { params });
  console.log("Fetching scheduled expenses with timezone:", userTimezone);
  
  return api.get("/recurring-expenses", config);
};

// 🔍 GET single scheduled expense
export const getScheduledExpense = (
  userTimezone: string,
  id: string
): Promise<AxiosResponse<ScheduledExpense>> => {
  const config = addTimezoneToConfig(userTimezone);
  console.log("Fetching single scheduled expense with timezone:", userTimezone);
  
  return api.get(`/recurring-expenses/${id}`, config);
};

// ➕ Create new scheduled expense
export const createScheduledExpense = (
  userTimezone: string,
  payload: Partial<ScheduledExpense> & { logIfPast?: boolean }
): Promise<AxiosResponse<ScheduledExpense>> => {
  console.log("Creating scheduled expense with timezone:", userTimezone);
  console.log("Payload before adding timezone:", payload);
  
  // Add timezone to payload
  const payloadWithTimezone = {
    ...payload,
    userTimezone
  };

  console.log("Creating scheduled expense with payload:", payloadWithTimezone);
  
  return api.post("/recurring-expenses", payloadWithTimezone);
};

// 🖊️ Update allowed fields of a scheduled expense
export const updateScheduledExpense = (
  userTimezone: string,
  id: string,
  payload: Partial<Pick<ScheduledExpense, "name" | "amount" | "endDate" | "isActive">>
): Promise<AxiosResponse<ScheduledExpense>> => {
  const config = addTimezoneToConfig(userTimezone);
  console.log("Updating scheduled expense with timezone:", userTimezone);
  
  return api.patch(`/recurring-expenses/${id}`, payload, config);
};

// ❌ Delete scheduled expense (no timezone needed)
export const deleteScheduledExpense = (
  id: string
): Promise<AxiosResponse<{ message: string }>> => {
  return api.delete(`/recurring-expenses/${id}`);
};

// 🔁 Toggle active status (no timezone needed)
export const toggleScheduledExpense = (
  id: string
): Promise<AxiosResponse<{ isActive: boolean }>> => {
  return api.patch(`/recurring-expenses/${id}/toggle`);
};

// 📊 Get summary data
export const getScheduledSummary = (
  userTimezone: string
): Promise<AxiosResponse<ScheduledSummary>> => {
  const config = addTimezoneToConfig(userTimezone);
  console.log("Fetching scheduled summary with timezone:", userTimezone);
  
  return api.get("/recurring-expenses/summary", config);
};

// 🛠️ Utility functions for working with timezone-aware dates
export const formatScheduledExpenseDate = (
  dateField: TimezoneAwareDate | string,
  format: 'date' | 'datetime' | 'utc' = 'date'
): string => {
  if (typeof dateField === 'string') {
    // Backward compatibility - format the string date
    const date = new Date(dateField);
    switch (format) {
      case 'datetime':
        return date.toLocaleString();
      case 'utc':
        return date.toISOString();
      default:
        return date.toLocaleDateString();
    }
  }
  
  // New format with timezone information
  switch (format) {
    case 'datetime':
      return dateField.userDateTime;
    case 'utc':
      return dateField.utc;
    default:
      return dateField.userDate;
  }
};

// Helper to extract just the date string for form inputs
export const getDateStringForInput = (
  dateField: TimezoneAwareDate | string
): string => {
  if (typeof dateField === 'string') {
    return dateField.split('T')[0]; // Extract YYYY-MM-DD from ISO string
  }
  return dateField.userDate;
};

// Helper to check if a date is overdue
export const isOverdue = (
  triggerDate: TimezoneAwareDate | string
): boolean => {
  const today = new Date();
  const compareDate = typeof triggerDate === 'string' 
    ? new Date(triggerDate) 
    : new Date(triggerDate.utc);
  
  return compareDate < today;
};

// Helper to get days until next trigger
export const getDaysUntilTrigger = (
  triggerDate: TimezoneAwareDate | string
): number => {
  const today = new Date();
  const compareDate = typeof triggerDate === 'string' 
    ? new Date(triggerDate) 
    : new Date(triggerDate.utc);
  
  const diffTime = compareDate.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};