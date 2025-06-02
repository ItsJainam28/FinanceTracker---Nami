import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  className,
}: {
  date?: Date;
  onDateChange: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
}) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal bg-background text-foreground border-border",
            !date && "text-muted-foreground",
            className
          )}
          type="button"
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-background border-border text-foreground" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onDateChange}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  initial: { name: string; amount: number; date: string; categoryId: string | undefined };
  categories: { _id: string; name: string }[];
  onSave: (data: {
    name: string;
    amount: number;
    date: string;
    categoryId: string | undefined;
  }) => Promise<void>;
}

export default function EditExpenseModal({
  open,
  onClose,
  initial,
  categories,
  onSave,
}: Props) {
  const [form, setForm] = useState(initial);
  const [date, setDate] = useState<Date | undefined>(
    initial.date ? new Date(initial.date) : undefined
  );

  useEffect(() => {
    setForm(initial);
    setDate(initial.date ? new Date(initial.date) : undefined);
  }, [initial]);

  if (!open) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleDateSelect = (selectedDate: Date | undefined) => {
    setDate(selectedDate);
    if (selectedDate) {
      setForm((p) => ({
        ...p,
        date: selectedDate.toISOString().split("T")[0],
      }));
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-background text-foreground border border-border rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
        <h2 className="text-xl font-semibold mb-4">Edit Expense</h2>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Expense name"
              className="bg-background text-foreground border-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Amount</label>
            <Input
              name="amount"
              type="number"
              step="0.01"
              value={form.amount}
              onChange={handleChange}
              placeholder="0.00"
              className="bg-background text-foreground border-border"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <DatePicker date={date} onDateChange={handleDateSelect} />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <Select
              value={form.categoryId || ""}
              onValueChange={(val) =>
                setForm((p) => ({ ...p, categoryId: val }))
              }
            >
              <SelectTrigger className="bg-background text-foreground border-border">
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent className="bg-background text-foreground border-border">
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c._id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="flex-1 border border-border"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
