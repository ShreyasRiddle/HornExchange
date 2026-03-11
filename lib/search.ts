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
  Tutoring: [
    "study help",
    "test prep",
    "office hours",
    "project help",
    "homework",
    "assignment",
    "midterm",
    "final",
    "quiz",
    "notes",
    "study",
    "tutor",
    "calc",
    "calculus",
    "physics",
    "exam",
    "class",
  ],
  Photography: ["photo", "headshot", "photography", "pictures", "grad"],
  "Resume Review": ["resume", "linkedin", "bullet", "internship", "career"],
  "Moving Help": ["move", "moving", "truck", "furniture", "pickup"],
};

const serviceIntentCategories = new Set<ServiceCategory>([
  "Tutoring",
  "Resume Review",
  "Moving Help",
]);

const utilityIntentSignals = [
  "study",
  "help",
  "homework",
  "assignment",
  "exam",
  "midterm",
  "final",
  "quiz",
  "project",
  "resume",
  "career",
  "internship",
  "move",
  "moving",
] as const;

const stylingIntentSignals = ["hair", "haircut", "barber", "fade", "braid", "braids", "stylist"] as const;

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

type IntentClassification = {
  category: ServiceCategory | "General";
  source: "ai" | "rules" | "fallback";
  confidence?: number;
};

function parseCategoryByRules(query: string): IntentClassification {
  const lowered = query.toLowerCase();
  let bestCategory: ServiceCategory | null = null;
  let bestScore = 0;
  for (const [category, keywords] of Object.entries(categoryKeywords) as [
    ServiceCategory,
    string[],
  ][]) {
    const score = keywords.reduce((total, keyword) => {
      if (!lowered.includes(keyword)) return total;
      // Phrase matches are stronger signals than single words.
      return total + (keyword.includes(" ") ? 4 : 1);
    }, 0);
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }

  if (!bestCategory) {
    return { category: "General", source: "fallback" };
  }

  return { category: bestCategory, source: "rules" };
}

async function classifyCategoryWithAI(query: string): Promise<IntentClassification | null> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 750);
  const categories = [
    "Haircuts",
    "Braiding",
    "Tutoring",
    "Photography",
    "Resume Review",
    "Moving Help",
    "General",
  ].join(", ");

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_SEARCH_MODEL ?? "gpt-4.1-mini",
        temperature: 0,
        input: [
          {
            role: "system",
            content:
              "Classify a UT student marketplace query into one category. Return strict JSON with keys: category, confidence.",
          },
          {
            role: "user",
            content: `Categories: ${categories}\nQuery: ${query}`,
          },
        ],
        text: {
          format: {
            type: "json_schema",
            name: "search_intent_classification",
            schema: {
              type: "object",
              properties: {
                category: {
                  type: "string",
                  enum: [
                    "Haircuts",
                    "Braiding",
                    "Tutoring",
                    "Photography",
                    "Resume Review",
                    "Moving Help",
                    "General",
                  ],
                },
                confidence: {
                  type: "number",
                  minimum: 0,
                  maximum: 1,
                },
              },
              required: ["category", "confidence"],
              additionalProperties: false,
            },
            strict: true,
          },
        },
      }),
      signal: controller.signal,
    });

    if (!response.ok) return null;
    const payload = (await response.json()) as { output_text?: string };
    if (!payload.output_text) return null;
    const parsed = JSON.parse(payload.output_text) as {
      category?: ServiceCategory | "General";
      confidence?: number;
    };
    if (!parsed.category || typeof parsed.confidence !== "number") return null;

    return {
      category: parsed.category,
      confidence: Math.max(0, Math.min(1, parsed.confidence)),
      source: "ai",
    };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function classifyIntentCategory(query: string): Promise<IntentClassification> {
  const aiClassification = await classifyCategoryWithAI(query);
  if (aiClassification && aiClassification.confidence !== undefined && aiClassification.confidence >= 0.55) {
    return aiClassification;
  }
  const rulesClassification = parseCategoryByRules(query);
  if (aiClassification && rulesClassification.category === "General") {
    return {
      category: aiClassification.category,
      confidence: aiClassification.confidence,
      source: "fallback",
    };
  }
  return rulesClassification;
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

function generalCategoryBoost(intent: SearchIntent, listing: RankedRecommendation) {
  if (intent.category !== "General") return rankWeights.category * 0.35;
  const lowered = intent.rawQuery.toLowerCase();
  const hasUtilitySignal = utilityIntentSignals.some((signal) => lowered.includes(signal));
  const hasStylingSignal = stylingIntentSignals.some((signal) => lowered.includes(signal));

  if (hasUtilitySignal && serviceIntentCategories.has(listing.category)) {
    return rankWeights.category * 0.62;
  }
  if (hasUtilitySignal) {
    return rankWeights.category * 0.18;
  }
  if (hasStylingSignal && (listing.category === "Haircuts" || listing.category === "Braiding")) {
    return rankWeights.category * 0.62;
  }
  if (hasStylingSignal) {
    return rankWeights.category * 0.2;
  }
  if (serviceIntentCategories.has(listing.category)) {
    return rankWeights.category * 0.5;
  }
  return rankWeights.category * 0.28;
}

export async function inferIntent(query: string): Promise<SearchIntent> {
  const lowered = query.toLowerCase();
  const maxPrice = parseBudget(lowered);
  const classification = await classifyIntentCategory(query);
  const category = classification.category;
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
    intentSource: classification.source,
    classificationConfidence: classification.confidence,
  };
}

function scoreListing(
  intent: SearchIntent,
  listing: RankedRecommendation,
): { score: number; factors: ScoreBreakdown } {
  const category =
    intent.category === "General"
      ? generalCategoryBoost(intent, listing)
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
    const speedReasons = [
      `${listing.responseTime} with near-term slots`,
      `${listing.recentMomentum} and ${listing.responseTime.toLowerCase()}`,
      `Quick scheduling with ${listing.schedule[0] ?? "open slots this week"}`,
      `${listing.responseTime} and a ${listing.vibe.toLowerCase()} service style`,
    ];
    const speedIndex = Math.abs(
      listing.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0),
    ) % speedReasons.length;
    return speedReasons[speedIndex];
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

export async function searchMarketplace(query: string): Promise<SearchResult> {
  const intent = await inferIntent(query);
  const recommendations = toRanked(intent);

  if (process.env.NODE_ENV !== "production") {
    const confidence =
      typeof intent.classificationConfidence === "number"
        ? ` (${Math.round(intent.classificationConfidence * 100)}%)`
        : "";
    console.debug(`[search] intentSource=${intent.intentSource ?? "unknown"} category=${intent.category}${confidence}`);
  }

  return {
    intent,
    recommendations,
  };
}
