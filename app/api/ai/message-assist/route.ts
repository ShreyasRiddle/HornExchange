import { NextRequest, NextResponse } from "next/server";
import { buildMessageAssist } from "@/lib/message-assist";
import { serviceListings } from "@/lib/seed-data";

export async function POST(request: NextRequest) {
  const { listingId } = (await request.json()) as { listingId?: string };
  const listing = serviceListings.find((entry) => entry.id === listingId);

  if (!listing) {
    return NextResponse.json(
      { error: "Listing not found for messaging assist." },
      { status: 404 },
    );
  }

  return NextResponse.json(buildMessageAssist(listing));
}
