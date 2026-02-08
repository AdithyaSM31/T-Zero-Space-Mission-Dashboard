"use client";

import { useEffect, useState, Suspense } from "react";
import { getAnalyticsData, Launch } from "@/lib/api";
import { AnalyticsCharts } from "@/components/AnalyticsCharts";
import { LoadingSpinner } from "@/components/Loading";

function AnalyticsContent() {
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const data = await getAnalyticsData();
                setLaunches(data);
            } catch (e) {
                console.error("Failed to fetch analytics data", e);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    if (loading) {
         return (
            <div className="h-96 flex items-center justify-center bg-white/5 rounded-2xl border border-white/10">
                <LoadingSpinner />
            </div>
         );
    }
    
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
        <AnalyticsContent />
      </Suspense>
    </div>
  );
}

