import { NextRequest, NextResponse } from "next/server";
import { refineRecommendations, searchMarketplace } from "@/lib/search";
import { SearchPreference } from "@/lib/types";

export async function POST(request: NextRequest) {
  const { query, preference } = (await request.json()) as {
    query?: string;
    preference?: SearchPreference;
  };

  if (!query?.trim() || !preference) {
    return NextResponse.json(
      { error: "Both the original search query and a refinement are required." },
      { status: 400 },
    );
  }

  const result = searchMarketplace(query);

  return NextResponse.json({
    ...result,
    recommendations: refineRecommendations(result.recommendations, preference),
  });
}
