"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { Launch } from "@/lib/api";
import { useMemo, useState, useEffect } from "react";

interface AnalyticsChartsProps {
  launches: Launch[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function AnalyticsCharts({ launches }: AnalyticsChartsProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);
  
  const stats = useMemo(() => {
     if (!launches.length) return { agencyData: [], statusData: [], insights: [] };

     // 1. Agency Frequency
     const agencyCount: Record<string, number> = {};
     // 2. Rocket Frequency
     const rocketCount: Record<string, number> = {};
     // 3. Status Count
     const statusCount: Record<string, number> = {};
     
     let successCount = 0;

     launches.forEach(launch => {
         const agency = launch.launch_service_provider.name;
         // Simplify agency names
         const simpleAgency = agency.includes("SpaceX") ? "SpaceX" : 
                              agency.includes("NASA") ? "NASA" : 
                              agency.includes("Indian") ? "ISRO" :
                              agency.includes("China") ? "CASC" :
                              agency.includes("Rocket Lab") ? "Rocket Lab" : 
                              agency.includes("Roscosmos") ? "Roscosmos" : "Other";
         
         agencyCount[simpleAgency] = (agencyCount[simpleAgency] || 0) + 1;
         
         const rocket = launch.rocket.configuration.name;
         rocketCount[rocket] = (rocketCount[rocket] || 0) + 1;

         const status = launch.status.name;
         statusCount[status] = (statusCount[status] || 0) + 1;
         
         if (launch.status.abbrev === "Success") successCount++;
     });

     const agencyData = Object.entries(agencyCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 6); // Top 6

     const statusData = Object.entries(statusCount)
        .map(([name, value]) => ({ name, value }));
        
     // Insights
     const mostActiveRocket = Object.entries(rocketCount).sort((a,b) => b[1] - a[1])[0];
     const successRate = ((successCount / launches.length) * 100).toFixed(1);

     return {
         agencyData,
         statusData,
         insights: [
             { label: "Dataset Analysis", value: `Last ${launches.length} Missions` },
             { label: "Most Active Agency", value: agencyData[0]?.name || "N/A" },
             { label: "Most Active Rocket", value: `${mostActiveRocket?.[0]} (${mostActiveRocket?.[1]} launches)` },
             { label: "Success Rate", value: `${successRate}%` }
         ]
     };
  }, [launches]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="rounded-2xl bg-white/5 p-6 border border-white/10 h-[400px]">
           <h2 className="text-xl font-semibold text-white mb-6">Launch Market Share (Recent)</h2>
           {isMounted ? (
             <ResponsiveContainer width="100%" height="90%" minWidth={0}>
               <BarChart data={stats.agencyData}>
                 <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                 <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                 <Tooltip 
                   contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                   itemStyle={{ color: '#fff' }}
                   cursor={{fill: 'rgba(255,255,255,0.05)'}}
                 />
                 <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 4, 4]} />
               </BarChart>
             </ResponsiveContainer>
           ) : (
             <div className="w-full h-full animate-pulse bg-white/5 rounded-lg" />
           )}
        </div>
        
         <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
           <h2 className="text-xl font-semibold text-white mb-6">Key Performance Indicators</h2>
           <div className="space-y-6">
              {stats.insights.map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-4 border-b border-white/5 last:border-0 hover:bg-white/5 px-2 rounded transition-colors">
                      <span className="text-gray-400">{item.label}</span>
                      <span className="text-white font-bold text-right">{item.value}</span>
                  </div>
              ))}
           </div>
           
           <div className="mt-8 h-[300px] w-full">
                <h3 className="text-sm font-medium text-gray-500 mb-4 text-center uppercase tracking-wider">Mission Outcomes</h3>
                {isMounted ? (
                    <ResponsiveContainer width="100%" height="100%" minWidth={0}>
                        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 20 }}>
                            <Pie
                                data={stats.statusData}
                                cx="50%"
                                cy="45%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {stats.statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.name === 'Launch Successful' ? '#10b981' : '#ef4444'} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#fff' }}
                                itemStyle={{ color: '#fff' }}
                            />
                            <Legend verticalAlign="bottom" height={36}/>
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <div className="w-24 h-24 rounded-full border-4 border-white/10 border-t-blue-500 animate-spin" />
                    </div>
                )}
           </div>
        </div>
    </div>
  );
}
