import { NextResponse } from "next/server";
import {
  boundedLimit,
  LaunchSourceError,
  upcomingSample,
} from "@/lib/launch-source";
export async function GET(request: Request) {
  try {
    const params = new URL(request.url).searchParams;
    const limit = boundedLimit(params.get("limit"), 10);
    const agencies = params.get("agencyIds")?.split(",").filter(Boolean);
    const now = Date.now();
    const data = await upcomingSample();
    return NextResponse.json(
      data
        .filter(
          (item) =>
            Date.parse(item.net) > now &&
            (!agencies?.length ||
              agencies.includes(String(item.launch_service_provider.id)))
        )
        .slice(0, limit)
    );
  } catch (error) {
    const status = error instanceof LaunchSourceError ? error.status : 502;
    return NextResponse.json(
      {
        error:
          status === 429
            ? "The launch provider is rate-limited. Please try again later."
            : "Launch source temporarily unavailable",
      },
      { status }
    );
  }
}
