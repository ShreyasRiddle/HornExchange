import { NextRequest, NextResponse } from "next/server";
import {
  AiErrorResponse,
  AiMessageAssistRequest,
  AiMessageAssistResponse,
  isNonEmptyString,
} from "@/lib/api-contracts";
import { buildMessageAssist } from "@/lib/message-assist";
import { serviceListings } from "@/lib/seed-data";

export async function POST(request: NextRequest) {
  const body = (await request.json()) as Partial<AiMessageAssistRequest>;
  const { listingId } = body;

  if (!isNonEmptyString(listingId)) {
    return NextResponse.json(
      { error: "A listingId is required for messaging assist." } satisfies AiErrorResponse,
      { status: 400 },
    );
  }

  const listing = serviceListings.find((entry) => entry.id === listingId);

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found for messaging assist." } satisfies AiErrorResponse,
      { status: 404 },
    );
  }

  return NextResponse.json<AiMessageAssistResponse>(buildMessageAssist(listing));
}
