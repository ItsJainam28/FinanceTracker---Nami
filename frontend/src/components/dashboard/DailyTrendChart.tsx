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
import { useEffect, useState } from "react";
import { DailyTrendEntry } from "@/types/analytics";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

interface Props {
  data: DailyTrendEntry[];
}

export default function DailyTrendChart({ data }: Props) {
  const [themeColor, setThemeColor] = useState("#ffffff");
  const [fillColor, setFillColor] = useState("rgba(255, 255, 255, 0.1)");

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);
    const primary = root.getPropertyValue("--color-primary").trim();

    setThemeColor(primary);
    setFillColor(primary.replace(")", " / 0.15)").replace("oklch", "oklch")); // fade fill
  }, []);

  const labels = data.map((d) => format(parseISO(d._id), "MMM d"));
  const values = data.map((d) => d.total);

  const chartData = {
    labels,
    datasets: [
      {
        label: "Daily Spending",
        data: values,
        borderColor: themeColor,
        backgroundColor: fillColor,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  return (
    <div className="w-full h-full bg-card border border-border rounded-xl p-4 flex items-center justify-center shadow-md">
      <div className="w-full h-[300px]">
        <Line
          data={chartData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              x: {
                ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim() },
                grid: { color: "oklch(1 0 0 / 0.08)" },
              },
              y: {
                ticks: { color: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim() },
                grid: { color: "oklch(1 0 0 / 0.08)" },
                beginAtZero: true,
              },
            },
            plugins: {
              legend: {
                labels: {
                  color: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
                },
              },
              tooltip: {
                backgroundColor: getComputedStyle(document.documentElement).getPropertyValue("--color-card").trim(),
                titleColor: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
                bodyColor: getComputedStyle(document.documentElement).getPropertyValue("--color-foreground").trim(),
              },
            },
          }}
        />
      </div>
    </div>
  );
}
