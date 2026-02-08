"use client";

import { useState, useCallback, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check } from "lucide-react";

const AGENCIES = [
  { id: "121", name: "SpaceX" },
  { id: "44", name: "NASA" },
  { id: "31", name: "ISRO" },
  { id: "63", name: "Roscosmos" },
  { id: "141", name: "Blue Origin" },
  { id: "124", name: "ULA" },
  { id: "27", name: "ESA" },
  { id: "88", name: "CASC" } // China
];

export function LaunchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // Get currently selected IDs from URL
  const selectedIds = searchParams.get("agencies")?.split(",") || [];

  const toggleAgency = useCallback((agencyId: string) => {
    const current = new Set(selectedIds);
    if (current.has(agencyId)) {
      current.delete(agencyId);
    } else {
      current.add(agencyId);
    }

    const newValue = Array.from(current).join(",");
    const params = new URLSearchParams(searchParams.toString());
    
    if (newValue) {
      params.set("agencies", newValue);
    } else {
      params.delete("agencies");
    }

    startTransition(() => {
        router.push(`?${params.toString()}`);
    });
  }, [selectedIds, searchParams, router]);

  return (
    <div className="rounded-2xl bg-white/5 p-6 border border-white/10">
      <h3 className="font-semibold text-white mb-4">Filter by Agency</h3>
      <div className="space-y-2">
        {AGENCIES.map((agency) => {
          const isSelected = selectedIds.includes(agency.id);
          return (
            <label 
                key={agency.id} 
                className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${isSelected ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}
            >
              <div
                className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${
                  isSelected ? "bg-blue-500 border-blue-500" : "border-gray-600 bg-gray-800"
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                <input
                    type="checkbox"
                    className="sr-only"
                    checked={isSelected}
                    onChange={() => toggleAgency(agency.id)}
                />
              </div>
              <span className={isSelected ? "text-white font-medium" : "text-gray-300"}>
                {agency.name}
              </span>
            </label>
          );
        })}
      </div>
       {isPending && (
          <div className="mt-4 text-xs text-blue-400 animate-pulse">Updating missions...</div>
      )}
    </div>
  );
}
