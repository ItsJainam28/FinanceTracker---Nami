import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { MonthlyComparisonEntry } from "@/types/analytics";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

interface Props {
  data: MonthlyComparisonEntry[];
}

export default function MonthlyComparisonChart({ data }: Props) {
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [foreground, setForeground] = useState("#ffffff");

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    setPrimaryColor(root.getPropertyValue("--color-primary").trim());
    setForeground(root.getPropertyValue("--color-foreground").trim());
  }, []);

  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Expenses",
        data: data.map((d) => d.expenses),
        backgroundColor: primaryColor,
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-md">
      <h2 className="text-lg font-semibold text-card-foreground mb-4">Monthly Comparison</h2>
      <div className="h-[300px]">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: foreground },
                grid: { color: "oklch(1 0 0 / 0.08)" },
              },
              y: {
                ticks: { color: foreground },
                grid: { color: "oklch(1 0 0 / 0.08)" },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: foreground,
                },
              },
              tooltip: {
                backgroundColor: "oklch(0.21 0.006 285.885)", // matches card in dark mode
                titleColor: foreground,
                bodyColor: foreground,
              },
            },
          }}
        />
      </div>
    </div>
  );
}
