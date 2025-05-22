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
        borderColor: "#34D399", // green
        backgroundColor: "rgba(52, 211, 153, 0.1)", // faded green
        tension: 0.3,
      },
    ],
  };

  return (
    <div className="bg-black border border-white/20 rounded-lg p-4">
      <h2 className="text-lg font-bold text-white mb-4">Cumulative Spending</h2>
      <div className="h-[300px]">
        <Line
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
