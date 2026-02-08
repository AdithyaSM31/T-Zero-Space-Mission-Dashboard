import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://lldev.thespacedevs.com/2.2.0",
};

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    
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

    const stats = {
      upcomingCount: upcoming.count || 0,
      ytdCount: ytd.count || 0,
      activeRocketsCount: rockets.count || 0,
      agenciesCount: agencies.count || 0,
    };
    
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch home stats:", error);
    return NextResponse.json({
      upcomingCount: 0,
      ytdCount: 0,
      activeRocketsCount: 0,
      agenciesCount: 0,
    }, { status: 500 });
  }
}
