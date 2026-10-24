import { NextResponse } from "next/server";
import {
  boundedLimit,
  LaunchSourceError,
  recentSample,
} from "@/lib/launch-source";
export async function GET(request: Request) {
  try {
    const limit = boundedLimit(
      new URL(request.url).searchParams.get("limit"),
      20
    );
    return NextResponse.json((await recentSample()).slice(0, limit));
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
