import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://ll.thespacedevs.com/2.2.0",
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit') || '20';

    const res = await fetch(`${BASE_URLS.SPACE_DEVS}/launch/previous/?limit=${limit}&mode=detailed`, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 3600 } });
    
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch recent launches" }, { status: res.status });
    }
    const data = await res.json();
    return NextResponse.json(data.results);
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
