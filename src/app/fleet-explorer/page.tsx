"use client";

import { useEffect, useState } from "react";
import { getUnifiedFleet, UnifiedRocket } from "@/lib/api";
import { FleetGrid } from "@/components/FleetGrid";

export default function FleetExplorer() {
  const [rockets, setRockets] = useState<UnifiedRocket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getUnifiedFleet();
        setRockets(data);
      } catch (error) {
        console.error("Failed to fetch fleet data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
      return (
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
            <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Fleet Explorer</h1>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-96 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
                ))}
            </div>
        </div>
      )
  }

  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Fleet Explorer</h1>
      {rockets.length > 0 ? (
         <FleetGrid rockets={rockets} />
      ) : (
         <div className="text-center py-20 text-gray-400">
            <p className="text-xl">Unable to load fleet data currently.</p>
            <p className="text-sm mt-2">Please check your connection or try again later.</p>
         </div>
      )}
    </div>
  );
}
