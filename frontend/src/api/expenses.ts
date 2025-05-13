import api from './axiosInstance';

export interface Expense {
  _id: string;
  name: string;
  amount: number;
  date: string;
  categoryId?: string;
  isRecurring: boolean;
}

export interface ExpensesListParams {
  page?: number;
  limit?: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  categoryIds?: string[];
  amountMin?: number;
  amountMax?: number;
  recurring?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

const BASE_URL = '/expenses';

export const listExpenses = (params: ExpensesListParams) => {
  const query = {
    ...params,
    categoryIds: params.categoryIds?.join(',')
  };
  return api.get<PaginatedResponse<Expense>>(BASE_URL, { params: query });
};

export const getExpense = (id: string) =>
  api.get<Expense>(`${BASE_URL}/${id}`);

export const createExpense = (payload: Partial<Expense>) =>
  api.post<Expense>(BASE_URL, payload);

export const updateExpense = (id: string, payload: Partial<Expense>) =>
  api.put<Expense>(`${BASE_URL}/${id}`, payload);

export const deleteExpense = (id: string) =>
  api.delete<void>(`${BASE_URL}/${id}`);

export const bulkDeleteExpenses = (ids: string[]) =>
  api.post<void>(`${BASE_URL}/bulk-delete`, { ids });
