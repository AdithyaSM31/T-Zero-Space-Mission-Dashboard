import { getHomeStats, getUpcomingLaunches } from "@/lib/api";
import { HomeContent } from "@/components/HomeContent";
import { FeaturedMissions } from "@/components/FeaturedMissions";
import { Suspense } from "react";
import { LoadingSpinner } from "@/components/Loading";

export const revalidate = 3600;

// Wrapper for Home Stats to suspend it
async function HomeStatsWrapper() {
    const stats = await getHomeStats();
    return <HomeContent stats={stats} />;
}

// Wrapper for Featured Missions to suspend it
async function FeaturedMissionsWrapper() {
    const featuredLaunches = await getUpcomingLaunches(3);
    return <FeaturedMissions launches={featuredLaunches} />;
}

// Server Component (Default in App Router)
export default function Home() {
  return (
    <div className="relative isolate overflow-hidden min-h-screen">
      {/* We can show the hero content *static* parts immediately if we separate them, 
          but HomeContent relies on stats. A better UX might be skeleton stats. 
          For now, we'll suspend the dynamic parts. 
      */}
      <Suspense fallback={
          <div className="h-screen flex items-center justify-center">
              <LoadingSpinner />
          </div>
      }>
        <HomeStatsWrapper />
      </Suspense>
      
      <Suspense fallback={
         <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
             <div className="h-8 w-48 bg-white/10 rounded mb-8"></div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                 {[1,2,3].map(i => <div key={i} className="bg-white/5 h-64 rounded-2xl animate-pulse"></div>)}
             </div>
         </div>
      }>
        <FeaturedMissionsWrapper />
      </Suspense>
    </div>
  );
}


