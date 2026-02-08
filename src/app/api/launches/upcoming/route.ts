import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://ll.thespacedevs.com/2.2.0",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit') || '10';
    const limit = parseInt(limitParam, 10);
    const agencyIds = searchParams.get('agencyIds');

    // Fetch extra records to account for filtering past launches
    // Use a safe buffer (e.g. limit + 5)
    const fetchLimit = limit + 5; 

    let url = `${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=${fetchLimit}&mode=detailed`;
    if (agencyIds) {
      url += `&lsp__id=${agencyIds}`;
    }
    
    const res = await fetch(url, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 60 } });
    
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from Space Devs" }, { status: res.status });
    }
    
    const data = await res.json();
    
    // Filter out past launches to ensure consistency with the "Next" endpoint
    const now = new Date().getTime();
    const upcoming = data.results.filter((l: any) => new Date(l.net).getTime() > now);

    // Return only the requested amount
    return NextResponse.json(upcoming.slice(0, limit));
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
