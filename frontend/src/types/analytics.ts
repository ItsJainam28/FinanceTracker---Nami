// src/types/analytics.ts
export interface CategorySummary {
    _id: string;
    total: number;
  }
  
  export interface DailyTrendEntry {
    _id: string; // ISO date string like "2025-05-20"
    total: number;
  }
  
  export interface ExpenseEntry {
    name: string;
    amount: number;
    date: string; // ISO
    categoryId: string;
  }
  
  export interface MonthlyComparisonEntry {
    month: string;
    expenses: number;
  }
  
  export interface RecurringExpenseEntry {
    name: string;
    amount: number;
    dueDate: string;
  }
  
  export interface BudgetTrackingEntry {
    categoryId: string;
    budget: number;
    spent: number;
  }
  
  export interface CumulativeSpendingEntry {
    day: string; // "2025-05-01"
    total: number;
  }
  
  export interface AnalyticsSummary {
    totalSpending: number;
    topCategories: CategorySummary[];
    dailyTrend: DailyTrendEntry[];
    largestExpenses: ExpenseEntry[];
    monthlyComparison: MonthlyComparisonEntry[];
    recurringExpenses: RecurringExpenseEntry[];
  }
  