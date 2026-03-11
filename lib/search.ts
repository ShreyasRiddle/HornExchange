import {
  RankedRecommendation,
  SearchIntent,
  SearchPreference,
  SearchResult,
  ServiceCategory,
} from "@/lib/types";
import { serviceListings } from "@/lib/seed-data";

const categoryKeywords: Record<ServiceCategory, string[]> = {
  Haircuts: ["haircut", "barber", "fade", "trim", "cut"],
  Braiding: ["braid", "braids", "stylist", "formal", "hair"],
  Tutoring: ["tutor", "calc", "calculus", "physics", "exam", "class"],
  Photography: ["photo", "headshot", "photography", "pictures", "grad"],
  "Resume Review": ["resume", "linkedin", "bullet", "internship", "career"],
  "Moving Help": ["move", "moving", "truck", "furniture", "pickup"],
};

const neighborhoodKeywords = [
  "West Campus",
  "North Campus",
  "Guadalupe",
  "Riverside",
  "Downtown Austin",
] as const;

const timingMap = [
  { key: "tonight", value: "Tonight" as const },
  { key: "tomorrow", value: "Tomorrow" as const },
  { key: "weekend", value: "Weekends" as const },
  { key: "this week", value: "This Week" as const },
];

function parseCategory(query: string) {
  const lowered = query.toLowerCase();
  for (const [category, keywords] of Object.entries(categoryKeywords) as [
    ServiceCategory,
    string[],
  ][]) {
    if (keywords.some((keyword) => lowered.includes(keyword))) {
      return category;
    }
  }

  return "General" as const;
}

export function inferIntent(query: string): SearchIntent {
  const lowered = query.toLowerCase();
  const budgetMatch = lowered.match(/\$(\d+)/) ?? lowered.match(/under (\d+)/);
  const category = parseCategory(query);
  const location = neighborhoodKeywords.find((spot) =>
    lowered.includes(spot.toLowerCase()),
  );
  const timing = timingMap.find(({ key }) => lowered.includes(key))?.value;
  const qualityFocus = lowered.includes("cheap")
    ? "Budget"
    : lowered.includes("trusted") || lowered.includes("best")
      ? "Trust"
      : lowered.includes("fast") || lowered.includes("soon")
        ? "Speed"
        : undefined;
  const vibe = lowered.includes("premium")
    ? "Premium"
    : lowered.includes("clean") || lowered.includes("polished")
      ? "Polished"
      : lowered.includes("chill") || lowered.includes("casual")
        ? "Casual"
        : undefined;
  const chips = [
    category !== "General" ? category : "Concierge search",
    budgetMatch ? `Under $${budgetMatch[1]}` : undefined,
    location,
    timing,
    qualityFocus === "Budget"
      ? "Budget friendly"
      : qualityFocus === "Trust"
        ? "Most trusted"
        : qualityFocus === "Speed"
          ? "Fast response"
          : undefined,
  ].filter(Boolean) as string[];

  return {
    rawQuery: query,
    category,
    maxPrice: budgetMatch ? Number(budgetMatch[1]) : undefined,
    location,
    timing,
    qualityFocus,
    vibe,
    chips,
  };
}

function scoreListing(intent: SearchIntent, listing: RankedRecommendation) {
  let score = 45;

  if (intent.category === listing.category) {
    score += 24;
  } else if (intent.category === "General") {
    score += 10;
  }

  if (intent.maxPrice) {
    const priceDelta = Math.abs(listing.price - intent.maxPrice);
    score += Math.max(0, 18 - priceDelta);
  } else {
    score += 10;
  }

  if (intent.location) {
    score += listing.neighborhood === intent.location ? 17 : 4;
  } else {
    score += 8;
  }

  if (intent.timing) {
    score += listing.availability.includes(intent.timing) ? 14 : 3;
  }

  if (intent.qualityFocus === "Trust") {
    score += listing.trustScore / 10;
  }

  if (intent.qualityFocus === "Budget") {
    score += Math.max(0, 10 - listing.price / 6);
  }

  if (intent.qualityFocus === "Speed") {
    score += listing.responseTime.includes("3 min")
      ? 10
      : listing.responseTime.includes("5 min")
        ? 8
        : listing.responseTime.includes("8 min")
          ? 6
          : 4;
  }

  if (intent.vibe && listing.vibe === intent.vibe) {
    score += 8;
  }

  score += listing.rating * 2;
  score += listing.trustScore / 12;

  return Math.round(score);
}

function buildReason(intent: SearchIntent, listing: RankedRecommendation) {
  const reasons = [];

  if (intent.location && listing.neighborhood === intent.location) {
    reasons.push(`Closest trusted option in ${listing.neighborhood}`);
  }

  if (intent.maxPrice && listing.price <= intent.maxPrice) {
    reasons.push(`Inside your budget at $${listing.price}`);
  }

  if (intent.timing && listing.availability.includes(intent.timing)) {
    reasons.push(`Actually available ${intent.timing.toLowerCase()}`);
  }

  if (listing.trustScore >= 92) {
    reasons.push(`Strong trust score at ${listing.trustScore}`);
  }

  if (reasons.length === 0) {
    reasons.push(`Top campus match for ${listing.category.toLowerCase()}`);
  }

  return reasons[0];
}

function toRanked(intent: SearchIntent) {
  return serviceListings
    .map((listing) => {
      const ranked = {
        ...listing,
        matchScore: 0,
        reason: "",
      };
      ranked.matchScore = scoreListing(intent, ranked);
      ranked.reason = buildReason(intent, ranked);
      return ranked;
    })
    .sort((left, right) => right.matchScore - left.matchScore);
}

export function refineRecommendations(
  recommendations: RankedRecommendation[],
  preference: SearchPreference,
) {
  const adjusted = [...recommendations];

  adjusted.sort((left, right) => {
    if (preference === "Cheaper") return left.price - right.price;
    if (preference === "Closer") return left.neighborhood.localeCompare(right.neighborhood);
    if (preference === "More Trusted") return right.trustScore - left.trustScore;
    if (preference === "Available Sooner") return left.schedule[0].localeCompare(right.schedule[0]);
    return left.vibe.localeCompare(right.vibe);
  });

  return adjusted.map((listing, index) => ({
    ...listing,
    matchScore: Math.max(72, listing.matchScore - index),
    reason:
      preference === "Cheaper"
        ? `Refined toward lower-priced options near ${listing.neighborhood}`
        : preference === "Closer"
          ? `Refined toward nearby matches around ${listing.neighborhood}`
          : preference === "More Trusted"
            ? `Refined toward providers with stronger trust and reviews`
            : preference === "Available Sooner"
              ? `Refined toward the earliest open slots`
              : `Refined away from the previous vibe`,
  }));
}

export function searchMarketplace(query: string): SearchResult {
  const intent = inferIntent(query);
  const recommendations = toRanked(intent);

  return {
    intent,
    recommendations,
  };
}
