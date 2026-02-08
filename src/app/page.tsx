"use client";

import { getHomeStats, getUpcomingLaunches, type HomeStats, type Launch } from "@/lib/api";
import { HomeContent } from "@/components/HomeContent";
import { FeaturedMissions } from "@/components/FeaturedMissions";
import { useEffect, useState } from "react";
import { LoadingSpinner } from "@/components/Loading";

export default function Home() {
  const [stats, setStats] = useState<HomeStats | null>(null);
  const [featuredLaunches, setFeaturedLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
        try {
            const [statsData, launchesData] = await Promise.all([
                getHomeStats(),
                getUpcomingLaunches(3)
            ]);
            setStats(statsData);
            setFeaturedLaunches(launchesData);
        } catch (e) {
            console.error("Failed to load home data", e);
        } finally {
            setLoading(false);
        }
    }
    loadData();
  }, []);

  if (loading || !stats) {
      return (
          <div className="h-screen flex items-center justify-center">
              <LoadingSpinner />
          </div>
      );
  }

  return (
    <div className="relative isolate overflow-hidden min-h-screen">
       <HomeContent stats={stats} />
       <FeaturedMissions launches={featuredLaunches} />
    </div>
  );
}


