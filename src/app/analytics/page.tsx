import { getAnalyticsData } from "@/lib/api";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/Loading";

export const revalidate = 3600;

async function AnalyticsData() {
    const launches = await getAnalyticsData();
    return <AnalyticsCharts launches={launches} />;
}

export default function AnalyticsHub() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Analytics Hub</h1>
      <p className="text-gray-400 mb-8">Real-time analysis of the last 100 global space vehicle launches.</p>
      
      <Suspense fallback={
          <div className="h-96 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
              <LoadingSpinner />
          </div>
      }>
        <AnalyticsData />
      </Suspense>
    </div>
  );
}

