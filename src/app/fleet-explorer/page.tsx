import { getUnifiedFleet } from "@/lib/api";
import { FleetGrid } from "@/components/FleetGrid";

// Cache for 1 day, fleet data doesn't change often
export const revalidate = 86400; 

export default async function FleetExplorer() {
  const rockets = await getUnifiedFleet();

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
