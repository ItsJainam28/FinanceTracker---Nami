import { Line } from "react-chartjs-2";
import { CumulativeSpendingEntry } from "@/types/analytics";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  data: CumulativeSpendingEntry[];
}

export default function CumulativeSpendingChart({ data }: Props) {
  const chartData = {
    labels: data.map((d) => d.day),
    datasets: [
      {
        label: "Cumulative Spending",
        data: data.map((d) => d.total),
        fill: true,
        borderColor: "oklch(0.705 0.213 47.604)", // primary
        backgroundColor: "oklch(0.705 0.213 47.604 / 0.1)", // faded primary
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-md">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">
        Cumulative Spending
      </h2>
      <div className="h-[300px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: "oklch(0.985 0 0)" }, // foreground
                grid: { color: "oklch(1 0 0 / 0.08)" }, // light grid
              },
              y: {
                ticks: { color: "oklch(0.985 0 0)" },
                grid: { color: "oklch(1 0 0 / 0.08)" },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: "oklch(0.985 0 0)",
                },
              },
              tooltip: {
                backgroundColor: "oklch(0.21 0.006 285.885)",
                titleColor: "oklch(0.985 0 0)",
                bodyColor: "oklch(0.985 0 0)",
              },
            },
          }}
        />
      </div>
    </div>
  );
}
