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
  const chartData = {
    labels: data.map((d) => d.month),
    datasets: [
      {
        label: "Expenses",
        data: data.map((d) => d.expenses),
        backgroundColor: "#60A5FA", // blue
      },
    ],
  };

  return (
    <div className="bg-black border border-white/20 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-4">Monthly Comparison</h2>
      <div className="h-[300px]">
        <Bar
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: "white" },
                grid: { color: "#1f2937" },
              },
              y: {
                ticks: { color: "white" },
                grid: { color: "#1f2937" },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                labels: { color: "white" },
              },
            },
          }}
        />
      </div>
    </div>
  );
}
