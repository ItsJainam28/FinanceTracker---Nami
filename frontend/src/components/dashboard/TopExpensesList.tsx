import { ExpenseEntry } from "@/types/analytics";

interface Props {
  data: ExpenseEntry[];
}

export default function TopExpensesList({ data }: Props) {
  return (
    <div className="mt-6">
      {/* TODO: Render list or bar of top expenses */}
      <div className="text-gray-400">Top 5 Expenses</div>
    </div>
  );
}
