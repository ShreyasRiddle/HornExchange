import { NextRequest, NextResponse } from "next/server";
import { generateListingDraft } from "@/lib/listing-assist";

export async function POST(request: NextRequest) {
  const { input } = (await request.json()) as { input?: string };

  if (!input?.trim()) {
    return NextResponse.json(
      { error: "Freeform seller input is required." },
      { status: 400 },
    );
  }

  return NextResponse.json(generateListingDraft(input));
}
