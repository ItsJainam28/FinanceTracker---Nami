import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from "chart.js";
import { format, parseISO } from "date-fns";
import { DailyTrendEntry } from "@/types/analytics";

ChartJS.register(
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip
);

interface Props {
  data: DailyTrendEntry[];
}

export default function DailyTrendChart({ data }: Props) {
  const labels = data.map((d) => format(parseISO(d._id), "MMM d"));
  const values = data.map((d) => d.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Spending",
        data: values,
        borderColor: "#60A5FA", // blue-400
        backgroundColor: "rgba(96, 165, 250, 0.2)",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="w-full h-full bg-black border border-white/20 rounded-lg p-4 flex items-center justify-center">
      <div className="w-full h-[300px]">
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
              legend: { labels: { color: "white" } },
            },
          }}
        />
      </div>
    </div>
  );
  
}
