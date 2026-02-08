import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://ll.thespacedevs.com/2.2.0",
};

export async function GET() {
  try {
    // Fetch top 10 to ensure we have a fallback if the first ones are just-launched but not yet scrubbed
    const res = await fetch(`${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=10`, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 60 } }); // Short cache for precision
    if (!res.ok) {
       return NextResponse.json(null); 
    }
    const data = await res.json();
    
    // Filter for launches in the future (plus a small buffer if needed, but strict future is safer for "Next Launch")
    const now = new Date().getTime();
    const nextLaunch = data.results.find((l: any) => new Date(l.net).getTime() > now) || data.results[0] || null;
    
    return NextResponse.json(nextLaunch);
  } catch (error) {
    console.error("API Error (NextLaunch):", error);
    return NextResponse.json(null, { status: 500 });
  }
}
