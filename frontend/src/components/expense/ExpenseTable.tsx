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
import {
  CalendarIcon,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import EditExpenseModal from "./EditExpenseModal";
import { ConfirmDialog } from "../common/ConfirmDialog";

export const ExpenseTable: React.FC = () => {
  const [params, setParams] = useState<ExpensesListParams>({
    page: 1,
    limit: 25,
  });

  // Ensure limit always has a default value
  const currentLimit = params.limit ?? 25;
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

  const { data, status, error, refetch } = useQuery<PaginatedResponse<Expense>>(
    {
      queryKey: ["expenses", params],
      queryFn: () => listExpenses(params).then((res) => res.data),
      placeholderData: keepPreviousData,
    }
  );

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
          dateFrom = dateTo = today.toISOString().split("T")[0];
          break;
        case "yesterday": {
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          dateFrom = dateTo = yesterday.toISOString().split("T")[0];
          break;
        }
        case "thisWeek": {
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay());
          dateFrom = startOfWeek.toISOString().split("T")[0];
          dateTo = today.toISOString().split("T")[0];
          break;
        }
        case "thisMonth": {
          const startOfMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            1
          );
          dateFrom = startOfMonth.toISOString().split("T")[0];
          dateTo = today.toISOString().split("T")[0];
          break;
        }
        case "lastMonth": {
          const startOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth() - 1,
            1
          );
          const endOfLastMonth = new Date(
            today.getFullYear(),
            today.getMonth(),
            0
          );
          dateFrom = startOfLastMonth.toISOString().split("T")[0];
          dateTo = endOfLastMonth.toISOString().split("T")[0];
          break;
        }
        case "last3Months": {
          const threeMonthsAgo = new Date(today);
          threeMonthsAgo.setMonth(today.getMonth() - 3);
          dateFrom = threeMonthsAgo.toISOString().split("T")[0];
          dateTo = today.toISOString().split("T")[0];
          break;
        }
        case "thisYear": {
          const startOfYear = new Date(today.getFullYear(), 0, 1);
          dateFrom = startOfYear.toISOString().split("T")[0];
          dateTo = today.toISOString().split("T")[0];
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

  const handleCustomDateChange = (
    type: "from" | "to",
    date: Date | undefined
  ) => {
    if (type === "from") {
      setFromDate(date);
      if (date) {
        const dateStr = format(date, "yyyy-MM-dd");
        setParams((prev) => ({ ...prev, dateFrom: dateStr, page: 1 }));
      } else {
        setParams((prev) => ({ ...prev, dateFrom: undefined, page: 1 }));
      }
    } else {
      setToDate(date);
      if (date) {
        const dateStr = format(date, "yyyy-MM-dd");
        setParams((prev) => ({ ...prev, dateTo: dateStr, page: 1 }));
      } else {
        setParams((prev) => ({ ...prev, dateTo: undefined, page: 1 }));
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

  const handleCustomAmountChange = (type: "min" | "max", value: string) => {
    const numValue = value !== "" ? Number(value) : undefined;
    setParams((prev) => ({
      ...prev,
      ...(type === "min" ? { amountMin: numValue } : {}),
      ...(type === "max" ? { amountMax: numValue } : {}),
      page: 1,
    }));
  };

  return (
    <div className="bg-card border border-border rounded-lg shadow-sm flex flex-col h-[75vh] max-h-[75vh] scroll-smooth ">
      {/* Filters */}
      <div className="p-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-10"
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

        {/* Filter Row */}
        <div className="flex flex-wrap gap-3">
          {/* Date Filter */}
          <div className="flex flex-col space-y-2">
            <select
              onChange={handleDateRangeChange}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">From:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-auto">
                        {fromDate ? (
                          format(fromDate, "MMM dd, yyyy")
                        ) : (
                          <span className="text-muted-foreground">
                            Pick date
                          </span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={fromDate}
                        onSelect={(date) =>
                          handleCustomDateChange("from", date)
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">To:</span>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm" className="w-auto">
                        {toDate ? (
                          format(toDate, "MMM dd, yyyy")
                        ) : (
                          <span className="text-muted-foreground">
                            Pick date
                          </span>
                        )}
                        <CalendarIcon className="ml-2 h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={toDate}
                        onSelect={(date) => handleCustomDateChange("to", date)}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            )}
          </div>

          {/* Amount Filter */}
          <div className="flex flex-col space-y-2">
            <select
              onChange={handleAmountRangeChange}
              className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
              <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
                <span className="text-sm font-medium">$</span>
                <Input
                  type="number"
                  placeholder="Min"
                  className="w-24"
                  onChange={(e) =>
                    handleCustomAmountChange("min", e.target.value)
                  }
                />
                <span className="text-sm text-muted-foreground">to</span>
                <Input
                  type="number"
                  placeholder="Max"
                  className="w-24"
                  onChange={(e) =>
                    handleCustomAmountChange("max", e.target.value)
                  }
                />
              </div>
            )}
          </div>

          {/* Category Filter */}
          <select
            onChange={handleCategoryChange}
            className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>

          {/* Recurring Filter */}
          <select
            onChange={handleRecurringChange}
            className="h-10 px-3 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Types</option>
            <option value="true">Recurring</option>
            <option value="false">One-time</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-hidden ">
        <div className="h-full overflow-y-auto custom-scrollbar">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Name</TableHead>
                <TableHead className="font-semibold">Amount</TableHead>
                <TableHead className="font-semibold">Date</TableHead>
                <TableHead className="font-semibold">Category</TableHead>
                <TableHead className="font-semibold">Type</TableHead>
                <TableHead className="font-semibold text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
                      <span className="text-muted-foreground">
                        Loading expenses...
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : data?.data.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12">
                    <div className="text-muted-foreground">
                      <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No expenses found</p>
                      <p className="text-sm">Try adjusting your filters</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data?.data.map((expense) => (
                  <TableRow
                    key={expense._id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {expense.name}
                    </TableCell>
                    <TableCell className="font-mono">
                      <span className="text-primary font-semibold">
                        ${expense.amount.toFixed(2)}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(expense.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
                        {expense.categoryId
                          ? categoryMap[expense.categoryId]
                          : "Uncategorized"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          expense.isRecurring
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {expense.isRecurring ? "Recurring" : "One-time"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditing(expense)}
                          className="h-8 px-3"
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setConfirmId(expense._id);
                            setConfirmOpen(true);
                          }}
                          className="h-8 px-3 text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <div className="flex items-center text-sm text-muted-foreground">
            Showing {((params.page ?? 1) - 1) * currentLimit + 1} to{" "}
            {Math.min((params.page ?? 1) * currentLimit, data.meta.total)} of{" "}
            {data.meta.total} results
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  page: Math.max(1, (prev.page ?? 1) - 1),
                }))
              }
              disabled={params.page === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from(
                { length: Math.min(5, data.meta.totalPages) },
                (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      size="sm"
                      variant={params.page === page ? "default" : "ghost"}
                      onClick={() => setParams((prev) => ({ ...prev, page }))}
                      className="h-8 w-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                setParams((prev) => ({
                  ...prev,
                  page: Math.min(data.meta.totalPages, (prev.page ?? 1) + 1),
                }))
              }
              disabled={params.page === data.meta.totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-2 ml-4">
              <span className="text-sm text-muted-foreground">Rows:</span>
              <select
                value={currentLimit}
                onChange={(e) =>
                  setParams((prev) => ({
                    ...prev,
                    limit: Number(e.target.value),
                    page: 1,
                  }))
                }
                className="h-8 px-2 rounded-md border border-input bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {[10, 25, 50, 100].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {editing && (
        <EditExpenseModal
          open={!!editing}
          onClose={() => setEditing(null)}
          initial={{
            name: editing.name,
            amount: editing.amount,
            date: editing.date.split("T")[0],
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
            await deleteExpense(confirmId);
            setConfirmOpen(false);
            setConfirmId(null);
            refetch();
          }}
        />
      )}
      
    </div>
  );
};
