import { NextResponse } from "next/server";
import { upcomingSample } from "@/lib/launch-source";
export async function GET() {
  try {
    return NextResponse.json(
      (await upcomingSample()).find(
        (item) => Date.parse(item.net) > Date.now()
      ) || null
    );
  } catch {
    return NextResponse.json(
      { error: "Launch source temporarily unavailable" },
      { status: 502 }
    );
  }
}
