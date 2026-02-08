// T-Zero API Client Strategy

const BASE_URLS = {
  SPACEX: "https://api.spacexdata.com/v4",
  SPACEX_V5: "https://api.spacexdata.com/v5",
  SPACE_DEVS: "https://lldev.thespacedevs.com/2.2.0", // Use Dev API for development (more lenient rate limits)
};

// Types for The Space Devs API (Unified Launch Data)
export interface Launch {
  id: string;
  name: string;
  status: {
    id: number;
    name: string;
    abbrev: string;
  };
  net: string; // No Earliest Launch Time
  window_start: string;
  window_end: string;
  launch_service_provider: {
    id: number;
    name: string;
    type: string;
  };
  rocket: {
    configuration: {
      id: number;
      name: string;
      family: string;
      variant: string;
    };
  };
  mission: {
    id: number;
    name: string;
    description: string;
    type: string;
  };
  pad: {
    id: number;
    name: string;
    location: {
        id: number;
        name: string;
    }
  };
  image: string;
}

// Types for SpaceX API (Deep Dive Data)
export interface SpaceXLaunch {
  id: string;
  flight_number: number;
  name: string;
  date_utc: string;
  date_unix: number;
  details: string | null;
  success: boolean | null;
  rocket: string; // ID reference
  payloads: string[]; // ID references
  launchpad: string; // ID reference
  links: {
    patch: {
      small: string | null;
      large: string | null;
    };
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
  };
}

export interface SpaceXRocket {
  id: string;
  name: string;
  type: string;
  active: boolean;
  stages: number;
  boosters: number;
  cost_per_launch: number;
  success_rate_pct: number;
  first_flight: string;
  country: string;
  company: string;
  height: { meters: number; feet: number };
  diameter: { meters: number; feet: number };
  mass: { kg: number; lb: number };
  description: string;
  flickr_images: string[];
}

// API Functions

// 1. Get Upcoming Launches (Unified: NASA + SpaceX + ISRO)
// We use The Space Devs for the "Launch Center" list because it includes EVERYONE.
export async function getUpcomingLaunches(limit = 10, agencyIds?: string): Promise<Launch[]> {
  try {
    let url = `${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=${limit}&mode=detailed`;
    if (agencyIds) {
      url += `&lsp__id=${agencyIds}`;
    }
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch upcoming launches");
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("API Error:", error);
    return []; // Return empty array on failure to prevent crash
  }
}

// 2. Get Rocket Fleet (Unified from The Space Devs)
const ROCKET_IDS = [
  164, // Falcon 9 Block 5
  464, // Starship
  143, // SLS Block 1
  38,  // PSLV-XL
  172, // LVM3
  116, // Ariane 64
  200, // Vulcan
  138  // New Glenn
];

export interface UnifiedRocket {
  id: number;
  name: string;
  description: string;
  family: string;
  variant: string;
  manufacturer: {
    name: string;
    country_code: string;
  };
  program: {
    name: string;
  }[];
  length: number; // m
  diameter: number; // m
  launch_mass: number; // tonnes
  leo_capacity: number; // kg
  to_thrust: number; // kN
  apogee: number; // km
  vehicle_range: number; // km
  image_url: string;
  info_url: string;
  wiki_url: string;
  total_launch_count: number;
  consecutive_successful_launches: number;
  successful_launches: number;
  failed_launches: number;
  pending_launches: number;
  maiden_flight: string;
}

export async function getUnifiedFleet(): Promise<UnifiedRocket[]> {
    try {
        const promises = ROCKET_IDS.map(async (id) => {
            try {
                 const res = await fetch(`${BASE_URLS.SPACE_DEVS}/config/launcher/${id}/`, { next: { revalidate: 86400 } });
                 if(!res.ok) return null;
                 return res.json();
            } catch (e) {
                console.error(`Failed to fetch rocket ${id}`, e);
                return null;
            }
        });

        const results = await Promise.all(promises);
        return results.filter((r): r is UnifiedRocket => r !== null);
    } catch (error) {
        console.error("Fleet API Error:", error);
        return [];
    }
}

// 3. Get Next Launch (Unified)
export async function getNextLaunch(): Promise<Launch | null> {
    try {
        const res = await fetch(`${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=1`, { next: { revalidate: 600 } });
        if (!res.ok) {
           // console.error(`Next Launch Fetch Failed: ${res.status}`);
           return null;
        }
        const data = await res.json();
        return data.results[0] || null;
      } catch (error) {
        console.error("API Error (NextLaunch):", error);
        return null;
      }
}

// 5. Get Recent Launches (Past)
export async function getRecentLaunches(limit = 20): Promise<Launch[]> {
  try {
    const res = await fetch(`${BASE_URLS.SPACE_DEVS}/launch/previous/?limit=${limit}&mode=detailed`, { next: { revalidate: 3600 } });
    if (!res.ok) throw new Error("Failed to fetch recent launches");
    const data = await res.json();
    return data.results;
  } catch (error) {
    console.error("API Error:", error);
    return [];
  }
}

// 6. Get Analytics Data (Last 100 Launches)
export async function getAnalyticsData(): Promise<Launch[]> {
    return getRecentLaunches(100);
}

export interface HomeStats {
  upcomingCount: number;
  ytdCount: number;
  activeRocketsCount: number;
  agenciesCount: number;
}

export async function getHomeStats(): Promise<HomeStats> {
  try {
    const currentYear = new Date().getFullYear();
    
    // Parallel fetch for counts using limit=1 to minimize data transfer
    const fetchCount = (url: string) => 
        fetch(url, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 3600 } })
            .then(res => res.ok ? res.json() : { count: 0 })
            .catch(err => {
                console.warn(`Fetch failed for ${url}:`, err);
                return { count: 0 };
            });

    const [upcoming, ytd, rockets, agencies] = await Promise.all([
      fetchCount(`${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=1`),
      fetchCount(`${BASE_URLS.SPACE_DEVS}/launch/?window_start__gte=${currentYear}-01-01T00:00:00Z&limit=1`),
      fetchCount(`${BASE_URLS.SPACE_DEVS}/config/launcher/?active=true&limit=1`),
      fetchCount(`${BASE_URLS.SPACE_DEVS}/agencies/?type=Government,Commercial&limit=1`)
    ]);

    return {
      upcomingCount: upcoming.count || 0,
      ytdCount: ytd.count || 0,
      activeRocketsCount: rockets.count || 0,
      agenciesCount: agencies.count || 0,
    };
  } catch (error) {
    console.error("Failed to fetch home stats:", error);
    return {
      upcomingCount: 0,
      ytdCount: 0,
      activeRocketsCount: 0,
      agenciesCount: 0,
    };
  }
}

