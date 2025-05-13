// src/components/expenses/ExpenseTable.tsx
import React, { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  listExpenses,
  Expense,
  ExpensesListParams,
  PaginatedResponse,
  updateExpense,
  deleteExpense,
} from "@/api/expenses";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { listCategories } from "@/api/category";
import { Category } from "@/api/category";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import EditExpenseModal  from "./EditExpenseModal";
import { ConfirmDialog } from "../common/ConfirmDialog";


export const ExpenseTable: React.FC= ({
}) => {
  const [params, setParams] = useState<ExpensesListParams>({
    page: 1,
    limit: 25,
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [showDateFilter, setShowDateFilter] = useState(false);
  const [showAmountFilter, setShowAmountFilter] = useState(false);
  const [dateRangeType, setDateRangeType] = useState("");
  const [fromDate, setFromDate] = useState<Date | undefined>(undefined);
  const [toDate, setToDate] = useState<Date | undefined>(undefined);
  const [editing, setEditing] = useState<Expense | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
const [confirmId, setConfirmId] = useState<string | null>(null);

  // Fetch categories for the dropdown
  const { data: categoriesData } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => listCategories().then((res) => res.data),
  });
  React.useEffect(() => {
    if (categoriesData) {
      setCategories(categoriesData);
    }
  }, [categoriesData]);

  // Create Category map for the dropdown
  const categoryMap = categories.reduce((acc, category) => {
    acc[category._id] = category.name;
    return acc;
  }, {} as Record<string, string>);
  const { data, status, error , refetch} = useQuery<PaginatedResponse<Expense>>({
    queryKey: ["expenses", params],
    queryFn: () => listExpenses(params).then((res) => res.data),
    placeholderData: keepPreviousData,
  });
  const isLoading = status === "pending";

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setParams((prev) => ({
      ...prev,
      categoryIds: value ? [value] : undefined,
      page: 1,
    }));
  };

  const handleRecurringChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setParams((prev) => ({
      ...prev,
      recurring: value === "" ? undefined : value === "true",
      page: 1,
    }));
  };

  const handleDateRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setDateRangeType(value);
    
    if (value !== "custom") {
      const today = new Date();
      let dateFrom: string | undefined;
      let dateTo: string | undefined;

      switch (value) {
        case "today":
          dateFrom = dateTo = today.toISOString().split('T')[0];
          break;
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          dateFrom = dateTo = yesterday.toISOString().split('T')[0];
          break;
        }
        case "thisWeek": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          dateFrom = startOfWeek.toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case "thisMonth": {
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          dateFrom = startOfMonth.toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case "lastMonth": {
          const startOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          dateFrom = startOfLastMonth.toISOString().split('T')[0];
          dateTo = endOfLastMonth.toISOString().split('T')[0];
          break;
        }
        case "last3Months": {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          dateFrom = threeMonthsAgo.toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        case "thisYear": {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          dateFrom = startOfYear.toISOString().split('T')[0];
          dateTo = today.toISOString().split('T')[0];
          break;
        }
        default:
          dateFrom = undefined;
          dateTo = undefined;
      }

      setParams((prev) => ({
        ...prev,
        dateFrom,
        dateTo,
        page: 1,
      }));
      setShowDateFilter(false);
    } else {
      setShowDateFilter(true);
    }
  };

  const handleCustomDateChange = (type: 'from' | 'to', date: Date | undefined) => {
    if (type === 'from') {
      setFromDate(date);
      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd');
        setParams(prev => ({ ...prev, dateFrom: dateStr, page: 1 }));
      } else {
        setParams(prev => ({ ...prev, dateFrom: undefined, page: 1 }));
      }
    } else {
      setToDate(date);
      if (date) {
        const dateStr = format(date, 'yyyy-MM-dd');
        setParams(prev => ({ ...prev, dateTo: dateStr, page: 1 }));
      } else {
        setParams(prev => ({ ...prev, dateTo: undefined, page: 1 }));
      }
    }
  };

  const handleAmountRangeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    
    if (value !== "custom") {
      let amountMin: number | undefined;
      let amountMax: number | undefined;

      switch (value) {
        case "under10":
          amountMin = 0;
          amountMax = 10;
          break;
        case "10to50":
          amountMin = 10;
          amountMax = 50;
          break;
        case "50to100":
          amountMin = 50;
          amountMax = 100;
          break;
        case "100to500":
          amountMin = 100;
          amountMax = 500;
          break;
        case "500to1000":
          amountMin = 500;
          amountMax = 1000;
          break;
        case "over1000":
          amountMin = 1000;
          amountMax = undefined;
          break;
        default:
          amountMin = undefined;
          amountMax = undefined;
      }

      setParams((prev) => ({
        ...prev,
        amountMin,
        amountMax,
        page: 1,
      }));
      setShowAmountFilter(false);
    } else {
      setShowAmountFilter(true);
    }
  };

  const handleCustomAmountChange = (type: 'min' | 'max', value: string) => {
    const numValue = value !== '' ? Number(value) : undefined;
    setParams((prev) => ({
      ...prev,
      ...(type === 'min' ? { amountMin: numValue } : {}),
      ...(type === 'max' ? { amountMax: numValue } : {}),
      page: 1,
    }));
  };

  return (
    <div className="bg-black text-white border border-white rounded-xl shadow-md p-6 space-y-6">
      {/* Top controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="bg-black text-white border-white placeholder:text-gray-400"
            placeholder="Search expenses..."
            onChange={(e) =>
              setParams((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex space-x-2">
            <select
              onChange={handleDateRangeChange}
              className="bg-black text-white border border-white rounded px-2 py-1"
            >
              <option value="">Date: Any time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="thisWeek">This week</option>
              <option value="thisMonth">This month</option>
              <option value="lastMonth">Last month</option>
              <option value="last3Months">Last 3 months</option>
              <option value="thisYear">This year</option>
              <option value="custom">Custom range...</option>
            </select>

            {showDateFilter && (
              <div className="flex items-center gap-2 ml-2">
                <div className="flex items-center gap-1">
                  <span className="text-sm">From:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-auto pl-3 pr-2 py-1 h-8 border-white text-white"
                      >
                        {fromDate ? (
                          format(fromDate, "PP")
                        ) : (
                          <span className="text-gray-400">Pick date</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black border border-white">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(date) => handleCustomDateChange('from', date)}
                        className="bg-black text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm">To:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-auto pl-3 pr-2 py-1 h-8 border-white text-white"
                      >
                        {toDate ? (
                          format(toDate, "PP")
                        ) : (
                          <span className="text-gray-400">Pick date</span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-black border border-white">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => handleCustomDateChange('to', date)}
                        className="bg-black text-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}

            <select
              onChange={handleAmountRangeChange}
              className="bg-black text-white border border-white rounded px-2 py-1"
            >
              <option value="">Amount: Any</option>
              <option value="under10">Under $10</option>
              <option value="10to50">$10 - $50</option>
              <option value="50to100">$50 - $100</option>
              <option value="100to500">$100 - $500</option>
              <option value="500to1000">$500 - $1000</option>
              <option value="over1000">Over $1000</option>
              <option value="custom">Custom range...</option>
            </select>

            {showAmountFilter && (
              <div className="flex items-center gap-2 ml-2">
                <span className="text-sm">$</span>
                <Input
                  type="number"
                  placeholder="Min"
                  className="bg-black text-white border border-white rounded px-2 py-1 w-24"
                  onChange={(e) => handleCustomAmountChange('min', e.target.value)}
                />
                <span className="text-sm">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="bg-black text-white border border-white rounded px-2 py-1 w-24"
                  onChange={(e) => handleCustomAmountChange('max', e.target.value)}
                />
              </div>
            )}

            <select
              onChange={handleCategoryChange}
              className="bg-black text-white border border-white rounded px-2 py-1"
            >
              <option value="">All Categories</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>
                  {category.name}
                </option>
              ))}
            </select>

            <select
              onChange={handleRecurringChange}
              className="bg-black text-white border border-white rounded px-2 py-1"
            >
              <option value="">All</option>
              <option value="true">Recurring</option>
              <option value="false">One-time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded border border-white">
        <Table>
          <TableHeader>
            <TableRow className="bg-neutral-900">
              <TableHead className="text-white">Name</TableHead>
              <TableHead className="text-white">Amount</TableHead>
              <TableHead className="text-white">Date</TableHead>
              <TableHead className="text-white">Category</TableHead>
              <TableHead className="text-white">Recurring</TableHead>
              <TableHead className="text-white">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
            ) : (
              data?.data.map((expense) => (
                <TableRow key={expense._id} className="hover:bg-neutral-800">
                  <TableCell>{expense.name}</TableCell>
                  <TableCell>${expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    {new Date(expense.date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {" "}
                    {expense.categoryId
                      ? categoryMap[expense.categoryId]
                      : "Uncategorized"}
                  </TableCell>
                  <TableCell>{expense.isRecurring ? "Yes" : "No"}</TableCell>
                  <TableCell className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {setEditing(expense)}}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setConfirmId(expense._id);
                        setConfirmOpen(true);
                      }}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {data && (
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="text-white border-white"
              size="sm"
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  page: Math.max(1, (prev.page ?? 1) - 1),
                }))
              }
              disabled={params.page === 1}
            >
              ← Prev
            </Button>

            {Array.from({ length: data.meta.totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                size="sm"
                variant={params.page === page ? 'default' : 'outline'}
                className={`${
                  params.page === page ? 'bg-white text-black' : 'text-white border-white'
                } px-3`}
                onClick={() => setParams((prev) => ({ ...prev, page }))}
              >
                {page}
              </Button>
            )).slice(0, 5)}

            <Button
              variant="outline"
              className="text-white border-white"
              size="sm"
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  page: Math.min(data.meta.totalPages, (prev.page ?? 1) + 1),
                }))
              }
              disabled={params.page === data.meta.totalPages}
            >
              Next →
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-white">Rows per page:</span>
            <select
              value={params.limit}
              onChange={(e) =>
                setParams((prev) => ({
                  ...prev,
                  limit: Number(e.target.value),
                  page: 1,
                }))
              }
              className="bg-black text-white border border-white rounded px-2 py-1"
            >
              {[10, 25, 50, 100].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
      {editing && (
  <EditExpenseModal
    open={!!editing}
    onClose={() => setEditing(null)}
    initial={{
      name: editing.name,
      amount: editing.amount,
      date: editing.date.split('T')[0],
      categoryId: editing.categoryId,
    }}
    categories={categories}
    onSave={async (updated) => {
      await updateExpense(editing._id, updated);
      setEditing(null);
      refetch();
    }}
  />
)}
{confirmId && (
  <ConfirmDialog
    open={confirmOpen}
    onClose={() => setConfirmOpen(false)}
    title="Delete Expense?"
    description="This action cannot be undone."
    onConfirm={async () => {
      await deleteExpense(confirmId); // your API call
      setConfirmOpen(false);
      setConfirmId(null);
      refetch(); // refresh list
    }}
  />
)}

    </div>
  );
};