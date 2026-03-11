import { NextRequest, NextResponse } from "next/server";
import {
  AiErrorResponse,
  AiGenerateListingRequest,
  AiGenerateListingResponse,
  isNonEmptyString,
} from "@/lib/api-contracts";
import { generateListingDraft } from "@/lib/listing-assist";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AiGenerateListingRequest>;
  const { input } = body;

  if (!isNonEmptyString(input)) {
    return NextResponse.json(
      { error: "Freeform seller input is required." } satisfies AiErrorResponse,
      { status: 400 },
    );
  }

  return NextResponse.json<AiGenerateListingResponse>(generateListingDraft(input));
}
