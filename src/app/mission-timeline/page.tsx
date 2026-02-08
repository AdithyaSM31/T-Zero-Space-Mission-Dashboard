"use client";

import { useEffect, useState, Suspense } from "react";
import { getRecentLaunches, Launch } from "@/lib/api";
import { LoadingList } from "@/components/Loading";

function TimelineContent() {
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getRecentLaunches(30);
        setLaunches(data);
      } catch (e) {
        console.error("Failed to load timeline data", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
      return <LoadingList />;
  }

  // Group launches by year
  const launchesByYear = launches.reduce((acc, launch) => {
    const year = new Date(launch.net).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(launch);
    return acc;
  }, {} as Record<number, Launch[]>);

  // Sort years descending
  const years = Object.keys(launchesByYear).map(Number).sort((a, b) => b - a);

  return (
    <div className="relative border-l border-white/10 ml-4 md:ml-0 space-y-12">
        {/* Timeline Items */}
        {years.map((year) => (
             <div key={year} className="mb-12">
                 <div className="sticky top-24 z-10 bg-slate-950 py-2 mb-4">
                    <span className="text-2xl font-bold text-blue-400">{year}</span>
                 </div>
                 
                 <div className="space-y-8 pl-8 md:pl-12 relative">
                    {launchesByYear[year].map((launch) => {
                        const launchDate = new Date(launch.net);
                        const isSuccess = launch.status.abbrev === "Success";
                        const isFailure = launch.status.abbrev === "Failure";
                        
                        return (
                         <div key={launch.id} className="relative group">
                            <div className={`absolute -left-[45px] md:-left-[61px] top-2 h-6 w-6 rounded-full bg-slate-900 border-2 z-20 ${isSuccess ? 'border-emerald-500' : isFailure ? 'border-red-500' : 'border-blue-500'}`} />
                            <div className="rounded-2xl bg-white/5 p-6 border border-white/10 hover:bg-white/10 transition-colors">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 text-sm text-blue-400 mb-1">
                                            <span>{launchDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                                            <span className="text-gray-600">•</span>
                                            <span className="text-gray-400">{launchDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">
                                            {launch.mission?.name || launch.name}
                                        </h3>
                                        <div className="text-sm text-gray-400 mt-1">{launch.launch_service_provider.name} • {launch.rocket.configuration.name}</div>
                                    </div>
                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset w-fit ${
                                        isSuccess ? 'bg-emerald-400/10 text-emerald-400 ring-emerald-400/20' : 
                                        isFailure ? 'bg-red-400/10 text-red-400 ring-red-400/20' : 
                                        'bg-blue-400/10 text-blue-400 ring-blue-400/20'
                                    }`}>
                                        {launch.status.name}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-sm leading-relaxed">
                                    {launch.mission?.description || "No mission description available."}
                                </p>
                                {launch.pad && (
                                    <div className="mt-4 pt-4 border-t border-white/5 text-xs text-gray-500">
                                        Launched from {launch.pad.name}, {launch.pad.location.name}
                                    </div>
                                )}
                            </div>
                         </div>
                    )})}
                 </div>
             </div>
        ))}
    </div>
  )
}

export default function MissionTimeline() {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">Mission Timeline</h1>
      <Suspense fallback={<LoadingList />}>
          <TimelineContent />
      </Suspense>
    </div>
  );
}


