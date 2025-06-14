import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  onClose: () => void;
  initial: {
    name: string;
    amount: number;
    endDate?: string | null;
    isActive: boolean;
  };
  onSave: (data: {
    name: string;
    amount: number;
    endDate?: string | null;
    isActive: boolean;
  }) => Promise<void>;
}

export default function EditScheduledExpenseModal({
  open,
  onClose,
  initial,
  onSave,
}: Props) {
  const [form, setForm] = useState(initial);

  useEffect(() => {
    if (open) setForm(initial);
  }, [open, initial]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background text-foreground border border-border rounded-xl max-w-md w-full p-6 shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Edit Scheduled Expense</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <Label className="text-sm mb-1 block">Name</Label>
            <Input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Amount */}
          <div>
            <Label className="text-sm mb-1 block">Amount</Label>
            <Input
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              required
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* End Date */}
          <div>
            <Label className="text-sm mb-1 block">End Date</Label>
            <Input
              type="date"
              name="endDate"
              value={form.endDate || ""}
              onChange={handleChange}
              className="bg-background text-foreground border-border"
            />
          </div>

          {/* Auto-payment Toggle */}
          <div className="flex items-center justify-between pt-2">
            <Label className="text-sm">Auto-payment Enabled</Label>
            <Switch
              checked={form.isActive}
              onCheckedChange={(val) =>
                setForm((prev) => ({ ...prev, isActive: val }))
              }
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="border border-border"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
