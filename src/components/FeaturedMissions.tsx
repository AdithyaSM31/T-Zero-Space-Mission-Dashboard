import Link from "next/link";
import { Launch } from "@/lib/api";

export function FeaturedMissions({ launches }: { launches: Launch[] }) {
  return (
    <div className="mx-auto max-w-7xl px-6 lg:px-8 py-10">
      <div className="flex justify-between items-end mb-8">
        <h2 className="text-2xl font-bold text-white">Next Up on the Pad</h2>
        <Link href="/launch-center" className="text-sm text-blue-400 hover:text-blue-300">
          View All &rarr;
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {launches.map((launch) => (
          <div
            key={launch.id}
            className="relative group overflow-hidden rounded-2xl bg-gray-900 aspect-[4/5] md:aspect-[4/5] lg:aspect-video border border-white/10 hover:border-blue-500/50 transition-all"
          >
            {/* Background Image if available */}
            {launch.image && (
                <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                    style={{ backgroundImage: `url(${launch.image})` }}
                />
            )}
            
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent z-10" />
            
            <div className="absolute bottom-0 left-0 p-6 z-20 w-full">
              <div className="flex justify-between items-start mb-2">
                  <div className="text-xs uppercase tracking-widest text-blue-400 font-semibold backdrop-blur-md bg-black/30 px-2 py-1 rounded">
                    {launch.launch_service_provider.name}
                  </div>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                {launch.mission?.name || launch.name}
              </h3>
              
              <p className="text-gray-400 text-sm line-clamp-2 mb-4">
                {launch.mission?.description || "No description available."}
              </p>

              <div className="flex items-center gap-2 text-xs text-gray-300">
                  <span className="bg-white/10 px-2 py-1 rounded">
                      {new Date(launch.net).toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                  </span>
                  <span className="truncate max-w-[150px]">{launch.pad.location.name}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
