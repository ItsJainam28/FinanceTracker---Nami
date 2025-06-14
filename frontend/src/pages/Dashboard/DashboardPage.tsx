import { useEffect, useState } from "react";
import {
  AnalyticsSummary,

  CumulativeSpendingEntry,
} from "@/types/analytics";
import {
  fetchAnalyticsSummary,

  fetchCumulativeSpending,
} from "@/api/analytics";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import SummaryCards from "@/components/dashboard/SummaryCards";
import SpendingByCategoryChart from "@/components/dashboard/SpendingByCategoryChart";
import DailyTrendChart from "@/components/dashboard/DailyTrendChart";
import MonthlyComparisonChart from "@/components/dashboard/MonthlyComparisonChart";
import CumulativeSpendingChart from "@/components/dashboard/CumulativeSpendingChart";
import { NavigationBar } from "@/components/common/Navigationbar";


export default function DashboardPage() {
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null);

  const [cumulativeData, setCumulativeData] = useState<CumulativeSpendingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const breadcrumbItems = [
    { label: "Home", href: "/dashboard" },
    { label: "Dashboard", isCurrentPage: true }
  ];

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      try {
        const [summaryRes,  cumulativeRes] = await Promise.all([
          fetchAnalyticsSummary(),
      
          fetchCumulativeSpending(),
        ]);

        setSummary(summaryRes.data);

        setCumulativeData(cumulativeRes.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  if (loading || !summary) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <NavigationBar items={breadcrumbItems} />
        <div className="flex-1 flex items-center justify-center text-foreground">
          Loading…
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <NavigationBar items={breadcrumbItems} />
      
      <main className="flex-1 text-foreground px-4 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
  
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="bg-muted text-muted-foreground">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              {/* <TabsTrigger value="top">Top Expenses</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-8">
              <SummaryCards data={summary} />
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2">
                  <SpendingByCategoryChart data={summary.topCategories} />
                </div>
                <div className="w-full lg:w-1/2">
                  <DailyTrendChart data={summary.dailyTrend} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-8">
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="w-full lg:w-1/2">
                  <MonthlyComparisonChart data={summary.monthlyComparison} />
                </div>
                <div className="w-full lg:w-1/2">
                  <CumulativeSpendingChart data={cumulativeData} />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="top" className="space-y-8">
            
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}