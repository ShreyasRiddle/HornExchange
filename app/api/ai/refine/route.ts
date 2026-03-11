import { NextRequest, NextResponse } from "next/server";
import {
  AiErrorResponse,
  AiRefineRequest,
  AiRefineResponse,
  isNonEmptyString,
  isSearchPreference,
} from "@/lib/api-contracts";
import { refineRecommendations, searchMarketplace } from "@/lib/search";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AiRefineRequest>;
  const { query, preference } = body;

  if (!isNonEmptyString(query) || !isSearchPreference(preference)) {
    return NextResponse.json(
      { error: "A valid query and refinement preference are required." } satisfies AiErrorResponse,
      { status: 400 },
    );
  }

  const result = await searchMarketplace(query);

  return NextResponse.json<AiRefineResponse>({
    ...result,
    recommendations: refineRecommendations(result.recommendations, preference),
  });
}
