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

const neighborhoodAliases = [
  { canonical: "West Campus", keywords: ["west campus", "wc"] },
  { canonical: "North Campus", keywords: ["north campus", "hyde park"] },
  { canonical: "Guadalupe", keywords: ["guadalupe", "the drag", "drag"] },
  { canonical: "Riverside", keywords: ["riverside", "east riverside"] },
  { canonical: "Downtown Austin", keywords: ["downtown", "downtown austin"] },
] as const;

const timingMap = [
  { key: "tonight", value: "Tonight" as const },
  { key: "today", value: "Tonight" as const },
  { key: "asap", value: "Tonight" as const },
  { key: "tomorrow", value: "Tomorrow" as const },
  { key: "this weekend", value: "Weekends" as const },
  { key: "weekend", value: "Weekends" as const },
  { key: "this week", value: "This Week" as const },
];

const rankWeights = {
  category: 40,
  location: 20,
  price: 15,
  timing: 15,
  trustRating: 10,
} as const;

type ScoreBreakdown = {
  category: number;
  location: number;
  price: number;
  timing: number;
  trustRating: number;
  qualityBonus: number;
  vibeBonus: number;
};

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

function parseBudget(lowered: string) {
  const explicitMoney =
    lowered.match(/\$(\d{1,3})/) ??
    lowered.match(/\bunder\s+(\d{1,3})\b/) ??
    lowered.match(/\bwithin\s+(\d{1,3})\b/) ??
    lowered.match(/\bmax(?:imum)?\s+(\d{1,3})\b/) ??
    lowered.match(/\bbudget\s+(\d{1,3})\b/);
  return explicitMoney ? Number(explicitMoney[1]) : undefined;
}

function parseLocation(lowered: string) {
  const found = neighborhoodAliases.find(({ keywords }) =>
    keywords.some((keyword) => lowered.includes(keyword)),
  );
  return found?.canonical;
}

function scheduleMinutes(schedule: string[]) {
  const parsed = schedule
    .map((slot) => {
      const match = slot.match(/\b(\d{1,2}):(\d{2})\s*(AM|PM)\b/i);
      if (!match) return Number.POSITIVE_INFINITY;
      const hours12 = Number(match[1]) % 12;
      const hours24 = match[3].toUpperCase() === "PM" ? hours12 + 12 : hours12;
      return hours24 * 60 + Number(match[2]);
    })
    .sort((a, b) => a - b);
  return parsed[0] ?? Number.POSITIVE_INFINITY;
}

function responseTimeMinutes(responseTime: string) {
  const match = responseTime.match(/(\d+)\s*min/i);
  return match ? Number(match[1]) : 30;
}

export function inferIntent(query: string): SearchIntent {
  const lowered = query.toLowerCase();
  const maxPrice = parseBudget(lowered);
  const category = parseCategory(query);
  const location = parseLocation(lowered);
  const timing = timingMap.find(({ key }) => lowered.includes(key))?.value;
  const qualityFocus =
    lowered.includes("cheap") ||
    lowered.includes("affordable") ||
    lowered.includes("budget")
      ? "Budget"
      : lowered.includes("trusted") ||
          lowered.includes("best") ||
          lowered.includes("reviews") ||
          lowered.includes("reliable")
      ? "Trust"
      : lowered.includes("fast") ||
          lowered.includes("soon") ||
          lowered.includes("quick") ||
          lowered.includes("asap")
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
    maxPrice ? `Under $${maxPrice}` : undefined,
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
    maxPrice,
    location,
    timing,
    qualityFocus,
    vibe,
    chips,
  };
}

function scoreListing(
  intent: SearchIntent,
  listing: RankedRecommendation,
): { score: number; factors: ScoreBreakdown } {
  const category =
    intent.category === "General"
      ? rankWeights.category * 0.35
      : intent.category === listing.category
        ? rankWeights.category
        : 0;
  const location =
    intent.location === undefined
      ? rankWeights.location * 0.4
      : intent.location === listing.neighborhood
        ? rankWeights.location
        : rankWeights.location * 0.2;
  const price =
    intent.maxPrice === undefined
      ? rankWeights.price * 0.55
      : listing.price <= intent.maxPrice
        ? rankWeights.price
        : Math.max(0, rankWeights.price - (listing.price - intent.maxPrice) * 0.6);
  const timing =
    intent.timing === undefined
      ? rankWeights.timing * 0.4
      : listing.availability.includes(intent.timing)
        ? rankWeights.timing
        : rankWeights.timing * 0.2;
  const trustRating =
    ((listing.trustScore / 100) * 0.65 + (listing.rating / 5) * 0.35) *
    rankWeights.trustRating;

  const qualityBonus =
    intent.qualityFocus === "Trust"
      ? (listing.trustScore / 100) * 8
      : intent.qualityFocus === "Budget"
        ? Math.max(0, 8 - listing.price / 6)
        : intent.qualityFocus === "Speed"
          ? Math.max(0, 8 - responseTimeMinutes(listing.responseTime) / 2.5)
          : 0;
  const vibeBonus = intent.vibe && listing.vibe === intent.vibe ? 4 : 0;

  const score = Math.round(
    category + location + price + timing + trustRating + qualityBonus + vibeBonus,
  );
  return {
    score,
    factors: {
      category,
      location,
      price,
      timing,
      trustRating,
      qualityBonus,
      vibeBonus,
    },
  };
}

function buildReason(
  intent: SearchIntent,
  listing: RankedRecommendation,
  factors: ScoreBreakdown,
) {
  const reasonCandidates = [
    {
      key: "category",
      score: factors.category,
      text:
        intent.category === listing.category
          ? `Category fit for ${listing.category.toLowerCase()}`
          : `Strong all-around campus service fit`,
    },
    {
      key: "price",
      score: factors.price,
      text:
        intent.maxPrice && listing.price <= intent.maxPrice
          ? `Inside your budget at $${listing.price}`
          : `Competitive campus pricing at $${listing.price}`,
    },
    {
      key: "location",
      score: factors.location,
      text:
        intent.location && listing.neighborhood === intent.location
          ? `Right in ${listing.neighborhood}`
          : `Viable location for UT pickup`,
    },
    {
      key: "timing",
      score: factors.timing,
      text:
        intent.timing && listing.availability.includes(intent.timing)
          ? `Available ${intent.timing.toLowerCase()}`
          : `Has near-term availability`,
    },
    {
      key: "trustRating",
      score: factors.trustRating,
      text: `Strong trust profile (${listing.trustScore}) and ${listing.rating.toFixed(1)} rating`,
    },
  ].sort((left, right) => right.score - left.score);

  if (factors.qualityBonus > 0 && intent.qualityFocus === "Speed") {
    return `Fast replies (${listing.responseTime.toLowerCase()}) for quick booking`;
  }
  if (factors.qualityBonus > 0 && intent.qualityFocus === "Trust") {
    return `Top trust emphasis with score ${listing.trustScore}`;
  }
  if (factors.qualityBonus > 0 && intent.qualityFocus === "Budget") {
    return `Budget-leaning pick at $${listing.price}`;
  }
  if (factors.vibeBonus > 0 && intent.vibe) {
    return `${intent.vibe} vibe match for your request`;
  }

  return reasonCandidates[0]?.text ?? `Strong UT service match`;
}

function toRanked(intent: SearchIntent) {
  return serviceListings
    .map((listing) => {
      const ranked = {
        ...listing,
        matchScore: 0,
        reason: "",
      };
      const scored = scoreListing(intent, ranked);
      ranked.matchScore = scored.score;
      ranked.reason = buildReason(intent, ranked, scored.factors);
      return {
        ranked,
        scored,
      };
    })
    .sort((left, right) => {
      if (right.ranked.matchScore !== left.ranked.matchScore) {
        return right.ranked.matchScore - left.ranked.matchScore;
      }

      const trustDelta = right.ranked.trustScore - left.ranked.trustScore;
      if (trustDelta !== 0) return trustDelta;

      const ratingDelta = right.ranked.rating - left.ranked.rating;
      if (ratingDelta !== 0) return ratingDelta;

      const responseDelta =
        responseTimeMinutes(left.ranked.responseTime) -
        responseTimeMinutes(right.ranked.responseTime);
      if (responseDelta !== 0) return responseDelta;

      return left.ranked.id.localeCompare(right.ranked.id);
    })
    .map(({ ranked }) => ranked);
}

export function refineRecommendations(
  recommendations: RankedRecommendation[],
  preference: SearchPreference,
) {
  const adjusted = [...recommendations].sort((left, right) => {
    if (preference === "Cheaper") {
      if (left.price !== right.price) return left.price - right.price;
      if (right.trustScore !== left.trustScore) return right.trustScore - left.trustScore;
      return left.id.localeCompare(right.id);
    }

    if (preference === "Closer") {
      if (left.neighborhood !== right.neighborhood) {
        return left.neighborhood.localeCompare(right.neighborhood);
      }
      if (right.matchScore !== left.matchScore) return right.matchScore - left.matchScore;
      return left.id.localeCompare(right.id);
    }

    if (preference === "More Trusted") {
      if (right.trustScore !== left.trustScore) return right.trustScore - left.trustScore;
      if (right.rating !== left.rating) return right.rating - left.rating;
      return left.id.localeCompare(right.id);
    }

    if (preference === "Available Sooner") {
      const timeDelta = scheduleMinutes(left.schedule) - scheduleMinutes(right.schedule);
      if (timeDelta !== 0) return timeDelta;
      if (responseTimeMinutes(left.responseTime) !== responseTimeMinutes(right.responseTime)) {
        return responseTimeMinutes(left.responseTime) - responseTimeMinutes(right.responseTime);
      }
      return left.id.localeCompare(right.id);
    }

    if (left.vibe !== right.vibe) return left.vibe.localeCompare(right.vibe);
    if (left.price !== right.price) return left.price - right.price;
    return left.id.localeCompare(right.id);
  });

  return adjusted.map((listing, index) => {
    const reason =
      preference === "Cheaper"
        ? `Refined for lower price first ($${listing.price})`
        : preference === "Closer"
          ? `Refined for neighborhood convenience around ${listing.neighborhood}`
          : preference === "More Trusted"
            ? `Refined for stronger trust (${listing.trustScore}) and rating (${listing.rating.toFixed(1)})`
            : preference === "Available Sooner"
              ? `Refined for earlier open slots (${listing.schedule[0]})`
              : `Refined for a different vibe (${listing.vibe.toLowerCase()})`;

    return {
    ...listing,
    matchScore: Math.max(72, listing.matchScore - index),
    reason,
  };
  });
}

export function searchMarketplace(query: string): SearchResult {
  const intent = inferIntent(query);
  const recommendations = toRanked(intent);

  return {
    intent,
    recommendations,
  };
}
