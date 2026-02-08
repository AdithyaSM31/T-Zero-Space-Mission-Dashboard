// T-Zero Client API Strategy
// This file now acts as a client-side SDK that fetches data from our own Next.js API Routes.
// This allows the logic to work securely both on the web and in the Android APK.

const API_HOST = process.env.NEXT_PUBLIC_API_URL || '';

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

// Types for SpaceX API (Deep Dive Data) - Kept for reference/future use
export interface SpaceXLaunch {
  id: string;
  flight_number: number;
  name: string;
  date_utc: string;
  date_unix: number;
  details: string | null;
  success: boolean | null;
  rocket: string; 
  payloads: string[];
  launchpad: string; 
  links: {
    patch: { small: string | null; large: string | null; };
    webcast: string | null;
    article: string | null;
    wikipedia: string | null;
  };
}

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
  program: { name: string; }[];
  length: number; 
  diameter: number; 
  launch_mass: number; 
  leo_capacity: number; 
  to_thrust: number; 
  apogee: number; 
  vehicle_range: number; 
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

// 1. Get Upcoming Launches
export async function getUpcomingLaunches(limit = 10, agencyIds?: string): Promise<Launch[]> {
  try {
    let url = `${API_HOST}/api/launches/upcoming?limit=${limit}`;
    if (agencyIds) {
      url += `&agencyIds=${agencyIds}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch upcoming launches");
    return await res.json();
  } catch (error) {
    console.error("Client API Error:", error);
    return [];
  }
}

// 2. Get Rocket Fleet
export async function getUnifiedFleet(): Promise<UnifiedRocket[]> {
    try {
        const res = await fetch(`${API_HOST}/api/fleet`);
        if(!res.ok) throw new Error("Failed to fetch fleet");
        return await res.json();
    } catch (error) {
        console.error("Client API Error:", error);
        return [];
    }
}

// 3. Get Next Launch
export async function getNextLaunch(): Promise<Launch | null> {
    try {
        const res = await fetch(`${API_HOST}/api/launches/next`);
        if (!res.ok) return null;
        return await res.json();
      } catch (error) {
        console.error("Client API Error:", error);
        return null;
      }
}

// 5. Get Recent Launches
export async function getRecentLaunches(limit = 20): Promise<Launch[]> {
  try {
    const res = await fetch(`${API_HOST}/api/launches/recent?limit=${limit}`);
    if (!res.ok) throw new Error("Failed to fetch recent launches");
    return await res.json();
  } catch (error) {
    console.error("Client API Error:", error);
    return [];
  }
}

// 6. Get Analytics Data 
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
    const res = await fetch(`${API_HOST}/api/stats`);
    if (!res.ok) throw new Error("Failed to fetch stats");
    return await res.json();
  } catch (error) {
    console.error("Client API Error:", error);
    return {
      upcomingCount: 0,
      ytdCount: 0,
      activeRocketsCount: 0,
      agenciesCount: 0,
    };
  }
}


