"use client";

import { useEffect, useState, Suspense } from "react";
import { getUpcomingLaunches, getNextLaunch, Launch } from "@/lib/api";
import { LaunchCountdown } from "@/components/LaunchCountdown";
import { LaunchFilters } from "@/components/LaunchFilters";
import { LoadingCard, LoadingList } from "@/components/Loading";
import { useSearchParams } from "next/navigation";

function LaunchCenterContent() {
    const searchParams = useSearchParams();
    const agencies = searchParams.get('agencies') || undefined;

    const [nextLaunch, setNextLaunch] = useState<Launch | null>(null);
    const [upcomingLaunches, setUpcomingLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            try {
                const [next, upcoming] = await Promise.all([
                    getNextLaunch(),
                    getUpcomingLaunches(10, agencies ? agencies : undefined)
                ]);
                setNextLaunch(next);
                setUpcomingLaunches(upcoming);
            } catch (error) {
                console.error("Failed to fetch launch data", error);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, [agencies]);

    if (loading) {
         return (
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
        );
    }

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
                        // Skip the first one as it's likely the featured one shown in countdown
                        upcomingLaunches.slice(1).map((launch) => (
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

export default function LaunchCenter() {
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
                <LaunchCenterContent />
            </Suspense>
        </div>
    );
}

