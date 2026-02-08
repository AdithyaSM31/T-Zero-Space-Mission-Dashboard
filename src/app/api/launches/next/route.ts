import { NextResponse } from "next/server";

const BASE_URLS = {
  SPACE_DEVS: "https://lldev.thespacedevs.com/2.2.0",
};

export async function GET() {
  try {
    const res = await fetch(`${BASE_URLS.SPACE_DEVS}/launch/upcoming/?limit=1`, { headers: { 'User-Agent': 'T-Zero/1.0' }, next: { revalidate: 600 } });
    if (!res.ok) {
       return NextResponse.json(null); // Or error
    }
    const data = await res.json();
    const nextLaunch = data.results[0] || null;
    return NextResponse.json(nextLaunch);
  } catch (error) {
    console.error("API Error (NextLaunch):", error);
    return NextResponse.json(null, { status: 500 });
  }
}
