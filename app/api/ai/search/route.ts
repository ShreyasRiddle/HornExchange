import { NextRequest, NextResponse } from "next/server";
import { searchMarketplace } from "@/lib/search";

export async function POST(request: NextRequest) {
  const { query } = (await request.json()) as { query?: string };

  if (!query?.trim()) {
    return NextResponse.json(
      { error: "A campus-style search prompt is required." },
      { status: 400 },
    );
  }

  return NextResponse.json(searchMarketplace(query));
}
