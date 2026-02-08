// Remove "use client" as this will be a Server Component primarily
import { getUpcomingLaunches as getUpcomingLaunchesApi, getNextLaunch as getNextLaunchApi } from "@/lib/api";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import { LaunchFilters } from "@/components/LaunchFilters";
import { Suspense } from "react";
import { LoadingCard, LoadingList } from "@/components/Loading";

// Re-exporting makes it easier if we move things, but for now importing directly
// We need to disable caching for real-time-ish data or set a revalidation period
export const revalidate = 3600; // Revalidate every hour for better caching

interface PageProps {
   searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

async function LaunchData({ agencies }: { agencies?: string }) {
    // Parallel fetch
    const [nextLaunch, upcomingLaunches] = await Promise.all([
        getNextLaunchApi(),
        getUpcomingLaunchesApi(10, agencies)
    ]);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           {/* Countdown Section */}
           <div className="rounded-2xl bg-white/5 p-8 border border-white/10">
              <h2 className="text-xl font-semibold text-white mb-4">Next Launch Countdown</h2>
              {nextLaunch ? (
                <LaunchCountdown 
                    targetDate={nextLaunch.net} 
                    missionName={nextLaunch.mission?.name || "Unknown Mission"}
                    agency={nextLaunch.launch_service_provider?.name || "Unknown Agency"}
                />
              ) : (
                <div className="text-center p-8 text-gray-400">No upcoming launches found.</div>
              )}
           </div>

           {/* Upcoming Launches */}
           <div className="space-y-4">
              <h2 className="text-xl font-semibold text-white">Upcoming Missions</h2>
              {upcomingLaunches.length > 0 ? (
                  upcomingLaunches.slice(1).map((launch) => ( // Skip the first one as it's likely the featured one
                     <div key={launch.id} className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:border-blue-500/50 transition-colors">
                        <div className="h-16 w-16 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden relative">
                            {launch.image ? (
                                <img src={launch.image} alt={launch.name} className="object-cover w-full h-full" />
                            ) : (
                                <div className="flex items-center justify-center w-full h-full text-xs text-gray-500">No Img</div>
                            )}
                        </div>
                        <div className="flex-1">
                           <h3 className="font-semibold text-white">{launch.name}</h3>
                           <p className="text-sm text-blue-400 mb-1">{launch.launch_service_provider?.name}</p>
                           <p className="text-sm text-gray-400">
                             {launch.pad?.location?.name} • {new Date(launch.net).toLocaleDateString()}
                           </p>
                        </div>
                        <div className="flex items-center">
                             <span className="text-xs font-mono bg-white/10 px-2 py-1 rounded text-gray-300">
                                {launch.status?.abbrev || "TBD"}
                             </span>
                        </div>
                     </div>
                  ))
              ) : (
                 <div className="text-gray-400">Loading upcoming launches...</div>
              )}
           </div>
        </div>

        <div className="space-y-8">
           {/* Filters */}
             <LaunchFilters />

             {/* Live Data Info */}
             <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
              <h3 className="font-semibold text-white mb-4">Live Data Partners</h3>
              <div className="space-y-4">
                 <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    The Space Devs API (Primary)
                 </div>
                 <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span className="w-2 h-2 rounded-full bg-green-500"></span>
                    SpaceX API v4 (Enrichment)
                 </div>
                 <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                    Data is refreshed every 60 seconds.
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
}

export default async function LaunchCenter(props: PageProps) {
  const searchParams = await props.searchParams;
  const agencies = typeof searchParams.agencies === 'string' ? searchParams.agencies : undefined;
  
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Launch Center</h1>
      <Suspense fallback={
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <LoadingCard />
                <LoadingList />
            </div>
             <div className="space-y-8">
                 <div className="h-64 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
                 <div className="h-48 rounded-2xl bg-white/5 border border-white/10 animate-pulse"></div>
             </div>
          </div>
      }>
        <LaunchData agencies={agencies} />
      </Suspense>
    </div>
  );
}

