import { useState, useEffect, useMemo } from "react";
import { CategorySummary } from "@/types/analytics";
import { Category, listCategories } from "@/api/category";
import { Pie, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

interface Props {
  data: CategorySummary[];
}

const colorPalette = [
  "#4ADE80", "#60A5FA", "#F472B6", "#FACC15", "#34D399",
  "#A78BFA", "#FB923C", "#F87171", "#818CF8", "#2DD4BF",
];

export default function SpendingByCategoryChart({ data }: Props) {
  const [chartType, setChartType] = useState<"pie" | "bar">("pie");
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});

  useEffect(() => {
    listCategories()
      .then((res) => {
        const map: Record<string, string> = {};
        res.data.forEach((cat: Category) => {
          map[cat._id] = cat.name;
        });
        setCategoryMap(map);
      })
      .catch((err) => console.error("Failed to load categories:", err));
  }, []);

  const total = data.reduce((sum, c) => sum + c.total, 0);

  const chartData = useMemo(() => {
    const labels = data.map((d) => categoryMap[d._id] || "Unknown");
    const values = data.map((d) => d.total);
    const colors = data.map((_, i) => colorPalette[i % colorPalette.length]);

    return {
      labels,
      datasets: [
        {
          label: "Spending",
          data: values,
          backgroundColor: colors,
          borderColor: "#1f2937",
          borderWidth: 1,
        },
      ],
    };
  }, [data, categoryMap]);

  const barBackgroundPlugin = {
    id: "custom_background",
    beforeDraw: (chart: any) => {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.fillStyle = "#111827";
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
      ctx.restore();
    },
  };

  return (
    <div className="h-full bg-black border border-white/20 rounded-lg p-4 flex flex-col justify-between">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-white text-lg font-bold text-center sm:text-left">
          Spending by Category
        </h2>
        <Tabs defaultValue={chartType} onValueChange={(val) => setChartType(val as any)}>
          <TabsList className="flex flex-wrap gap-2 justify-center sm:justify-end">
            <TabsTrigger value="pie">Pie</TabsTrigger>
            <TabsTrigger value="bar">Bar</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 w-full flex items-center justify-center">
        <div className="w-full h-[300px]">
          {chartType === "pie" ? (
            <Pie
              data={chartData}
              options={{
                plugins: {
                  legend: {
                    labels: {
                      color: "white",
                      boxWidth: 14,
                      padding: 10,
                    },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <Bar
              data={chartData}
              options={{
                maintainAspectRatio: false,
                plugins: {
                  legend: { display: false },
                },
                scales: {
                  x: {
                    grid: { color: "#1f2937", lineWidth: 0.5 },
                    ticks: { color: "white", maxRotation: 40, minRotation: 40 },
                  },
                  y: {
                    grid: { color: "#1f2937", lineWidth: 0.5 },
                    ticks: { color: "white" },
                    beginAtZero: true,
                  },
                },
              }}
              plugins={[barBackgroundPlugin]}
            />
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400 text-center">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}
