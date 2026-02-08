"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { type UnifiedRocket } from "@/lib/api";
import { RocketModal } from "./RocketModal";

interface FleetGridProps {
  rockets: UnifiedRocket[];
}

export function FleetGrid({ rockets }: FleetGridProps) {
  const [selectedRocket, setSelectedRocket] = useState<UnifiedRocket | null>(null);

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rockets.map((rocket) => (
          <div 
            key={rocket.id} 
            className="flex flex-col rounded-2xl bg-white/5 p-6 border border-white/10 hover:border-blue-500/50 transition-all cursor-pointer group relative overflow-hidden"
            onClick={() => setSelectedRocket(rocket)}
          >
            {/* Hover overlay hint */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors z-0" />
            
            <div className="aspect-[3/4] bg-slate-800 rounded-xl mb-6 relative overflow-hidden z-10 w-full group-hover:scale-[1.02] transition-transform duration-500">
               {rocket.image_url ? (
                 <img src={rocket.image_url} alt={rocket.name} className="absolute inset-0 h-full w-full object-cover" />
               ) : (
                 <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center text-gray-500">
                    No Image
                 </div>
               )}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent" />
               
               <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="inline-flex items-center rounded-md bg-blue-400/10 px-2 py-1 text-xs font-medium text-blue-400 ring-1 ring-inset ring-blue-400/20 backdrop-blur-md">
                    {rocket.manufacturer.name}
                  </span>
                  <div className="p-2 bg-white/10 rounded-full backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0">
                     <Info className="w-5 h-5 text-white" />
                  </div>
               </div>
            </div>

            <div className="z-10 relative">
                <h2 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors mb-4">{rocket.name}</h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Status</p>
                        <p className="text-white font-medium">Active</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Flights</p>
                        <p className="text-white font-medium">{rocket.total_launch_count}</p>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      <RocketModal 
        rocket={selectedRocket} 
        isOpen={!!selectedRocket} 
        onClose={() => setSelectedRocket(null)} 
      />
    </>
  );
}
