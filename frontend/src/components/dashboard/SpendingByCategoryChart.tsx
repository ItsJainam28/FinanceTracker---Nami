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

export default function SpendingByCategoryChart({ data }: Props) {
  const [chartType, setChartType] = useState<"pie" | "bar">("bar");
  const [categoryMap, setCategoryMap] = useState<Record<string, string>>({});
  const [randomColors, setRandomColors] = useState<string[]>([]);
  const [barColor, setBarColor] = useState<string>("#f97316"); // fallback orange
  const [cardColor, setCardColor] = useState("#000000");
  const [textColor, setTextColor] = useState("#ffffff");

  const [borderColor, setBorderColor] = useState("#444");

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

  useEffect(() => {
    const root = getComputedStyle(document.documentElement);

    const primary = root.getPropertyValue("--color-primary").trim();
    const foreground = root.getPropertyValue("--color-foreground").trim();

    const card = root.getPropertyValue("--color-card").trim();
    const border = root.getPropertyValue("--color-border").trim();

    setBarColor(primary || "#f97316");
    setTextColor(foreground);

    setCardColor(card);
    setBorderColor(border);

    // Generate random pastel-ish colors for the pie chart
    const randoms = Array.from({ length: 12 }, () =>
      `hsl(${Math.floor(Math.random() * 360)}, 70%, 65%)`
    );
    setRandomColors(randoms);
  }, []);

  const total = data.reduce((sum, c) => sum + c.total, 0);

  const chartData = useMemo(() => {
    const labels = data.map((d) => categoryMap[d._id] || "Unknown");
    const values = data.map((d) => d.total);

    const backgroundColor =
      chartType === "pie"
        ? data.map((_, i) => randomColors[i % randomColors.length])
        : barColor;

    return {
      labels,
      datasets: [
        {
          label: "Spending",
          data: values,
          backgroundColor,
          borderColor,
          borderWidth: 1,
        },
      ],
    };
  }, [data, categoryMap, chartType, randomColors, barColor, borderColor]);

  const barBackgroundPlugin = {
    id: "custom_background",
    beforeDraw: (chart: any) => {
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.fillStyle = cardColor;
      ctx.fillRect(chartArea.left, chartArea.top, chartArea.width, chartArea.height);
      ctx.restore();
    },
  };

  return (
    <div className="h-full bg-card border border-border rounded-xl p-4 flex flex-col justify-between shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
        <h2 className="text-card-foreground text-lg font-semibold text-center sm:text-left">
          Spending by Category
        </h2>
        <Tabs defaultValue={chartType} onValueChange={(val) => setChartType(val as any)}>
          <TabsList className="flex flex-wrap gap-2 justify-center sm:justify-end bg-muted text-muted-foreground">
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
                      color: textColor,
                      boxWidth: 14,
                      padding: 10,
                    },
                  },
                  tooltip: {
                    backgroundColor: cardColor,
                    titleColor: textColor,
                    bodyColor: textColor,
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
                    grid: { color: "oklch(1 0 0 / 0.08)", lineWidth: 0.5 },
                    ticks: { color: textColor, maxRotation: 40, minRotation: 40 },
                  },
                  y: {
                    grid: { color: "oklch(1 0 0 / 0.08)", lineWidth: 0.5 },
                    ticks: { color: textColor },
                    beginAtZero: true,
                  },
                },
              }}
              plugins={[barBackgroundPlugin]}
            />
          )}
        </div>
      </div>

      <div className="mt-4 text-sm text-muted-foreground text-center">
        Total: ${total.toFixed(2)}
      </div>
    </div>
  );
}
