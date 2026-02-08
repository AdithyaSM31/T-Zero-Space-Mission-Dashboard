import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://lldev.thespacedevs.com/2.2.0",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '10';
    const agencyIds = searchParams.get('agencyIds');

    let url = `${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=${limit}&mode=detailed`;
    if (agencyIds) {
      url += `&lsp__id=${agencyIds}`;
    }
    
    // Fetch from external API with caching enabled on Vercel
    const res = await fetch(url, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 3600 } });
    
    if (!res.ok) {
        return NextResponse.json({ error: "Failed to fetch from Space Devs" }, { status: res.status });
    }
    
    const data = await res.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
