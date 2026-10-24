import { unstable_cache } from "next/cache";
import type { Launch } from "./api";

type SourceLaunch = Launch & {
  pad: Launch["pad"] & { latitude?: string; longitude?: string };
};
export class LaunchSourceError extends Error {
  constructor(public status: number) {
    super(`Launch source returned ${status}`);
  }
}
// Cache the normalized records, not the provider's multi-megabyte detailed response.
// A single bounded sample is shared by the overview, launch list, history, and analytics.
function loader(kind: "upcoming" | "previous", seconds: number) {
  return unstable_cache(
    async (): Promise<SourceLaunch[]> => {
      const response = await fetch(
        `https://ll.thespacedevs.com/2.2.0/launch/${kind}/?limit=100&mode=detailed`,
        {
          cache: "no-store",
          signal: AbortSignal.timeout(15000),
          headers: { "User-Agent": "T-Zero/2.0" },
        }
      );
      if (!response.ok) throw new LaunchSourceError(response.status);
      const payload = (await response.json()) as { results: SourceLaunch[] };
      if (!Array.isArray(payload.results))
        throw new Error("Invalid launch source payload");
      return payload.results.map((item) => ({
        id: item.id,
        name: item.name,
        net: item.net,
        net_precision: item.net_precision,
        window_start: item.window_start,
        window_end: item.window_end,
        status: {
          id: item.status.id,
          name: item.status.name,
          abbrev: item.status.abbrev,
        },
        launch_service_provider: {
          id: item.launch_service_provider.id,
          name: item.launch_service_provider.name,
          type: item.launch_service_provider.type,
        },
        rocket: {
          configuration: {
            id: item.rocket.configuration.id,
            name: item.rocket.configuration.name,
            family: item.rocket.configuration.family,
            variant: item.rocket.configuration.variant,
          },
        },
        mission: item.mission
          ? {
              id: item.mission.id,
              name: item.mission.name,
              description: item.mission.description,
              type: item.mission.type,
            }
          : item.mission,
        pad: {
          id: item.pad.id,
          name: item.pad.name,
          latitude: item.pad.latitude,
          longitude: item.pad.longitude,
          location: { id: item.pad.location.id, name: item.pad.location.name },
        },
        image: item.image,
      }));
    },
    [`tzero-${kind}-normalized-v1`],
    { revalidate: seconds }
  );
}
export const upcomingSample = loader("upcoming", 60);
export const recentSample = loader("previous", 3600);
export function boundedLimit(input: string | null, defaultLimit: number) {
  const value = Number(input ?? defaultLimit);
  return Number.isFinite(value)
    ? Math.max(1, Math.min(100, Math.floor(value)))
    : defaultLimit;
}
