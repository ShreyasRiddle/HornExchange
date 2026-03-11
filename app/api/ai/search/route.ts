import { NextRequest, NextResponse } from "next/server";
import {
  AiErrorResponse,
  AiSearchRequest,
  AiSearchResponse,
  isNonEmptyString,
} from "@/lib/api-contracts";
import { searchMarketplace } from "@/lib/search";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AiSearchRequest>;
  const { query } = body;

  if (!isNonEmptyString(query)) {
    return NextResponse.json(
      { error: "A campus-style search prompt is required." } satisfies AiErrorResponse,
      { status: 400 },
    );
  }

  return NextResponse.json<AiSearchResponse>(await searchMarketplace(query));
}
