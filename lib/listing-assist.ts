import { ListingAssistResponse, ServiceCategory } from "@/lib/types";

const categoryRules: Array<{ category: ServiceCategory; match: RegExp }> = [
  { category: "Haircuts", match: /hair|fade|trim|barber/i },
  { category: "Braiding", match: /braid|formal|style/i },
  { category: "Tutoring", match: /tutor|calc|physics|exam|class/i },
  { category: "Photography", match: /photo|grad|headshot|portrait/i },
  { category: "Resume Review", match: /resume|linkedin|internship/i },
  { category: "Moving Help", match: /move|truck|furniture|storage/i },
];

function inferTitle(category: ServiceCategory, lower: string) {
  const isFast = /fast|quick|same day|asap|tonight/.test(lower);
  const locationTag = lower.includes("west campus")
    ? "West Campus"
    : lower.includes("north campus")
      ? "North Campus"
      : "UT";

  if (category === "Haircuts") {
    return `${locationTag} Student Fades and Clean Cuts`;
  }
  if (category === "Braiding") {
    return isFast
      ? `${locationTag} Event Braids With Fast Turnaround`
      : `${locationTag} Event-Ready Braids for Students`;
  }
  if (category === "Tutoring") {
    return isFast
      ? `${locationTag} Last-Minute Tutoring Sessions`
      : `${locationTag} Tutoring for Exam Week`;
  }
  if (category === "Photography") {
    return `${locationTag} Headshots and Grad Portrait Sessions`;
  }
  if (category === "Resume Review") {
    return `${locationTag} Resume Review Before Recruiting`;
  }
  return `${locationTag} Move-Out and Haul Help`;
}

function buildDescription(normalized: string, category: ServiceCategory, lower: string) {
  const buyerNeed =
    category === "Tutoring"
      ? "unstick a class fast before a quiz or exam"
      : category === "Resume Review"
        ? "ship stronger applications before deadlines"
        : category === "Moving Help"
          ? "handle move-out without last-minute stress"
          : category === "Photography"
            ? "get polished photos for orgs, recruiting, and grad"
            : category === "Braiding"
              ? "lock in a reliable style before events"
              : "book a clean cut near campus without a long wait";

  const trustCue = /review|trusted|reliable|experienced/.test(lower)
    ? "You already signal trust, so keep that line near the top of your listing."
    : "Add one trust line (years of experience, repeat clients, or review count) to improve conversion.";

  return `From your notes: ${normalized}. Reframed for UT buyers: clearly state what you do, who it helps, and your expected turnaround so students can decide quickly. This listing should help someone ${buyerNeed}. ${trustCue}`;
}

export function generateListingDraft(input: string): ListingAssistResponse {
  const trimmed = input.trim();
  const normalized = trimmed.replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  const category =
    categoryRules.find(({ match }) => match.test(normalized))?.category ?? "Tutoring";

  const hasPrice = /\$\d+|\b\d+\s?(usd|dollars?)\b/i.test(normalized);
  const hasCampusLocation = /(west campus|north campus|guadalupe|riverside|downtown)/i.test(
    normalized,
  );
  const hasTiming = /(tonight|tomorrow|this week|weekend|same day|asap)/i.test(normalized);

  const tags = [
    category.toLowerCase(),
    lower.includes("west campus")
      ? "west campus"
      : lower.includes("north campus")
        ? "north campus"
        : "ut students",
    hasPrice ? "transparent pricing" : "price on request",
    /(same day|tonight|quick|fast|asap)/i.test(normalized) ? "fast replies" : "reliable scheduling",
  ];

  const availabilityHint = lower.includes("tonight")
    ? "Lead with tonight slots and one exact time window to increase replies."
    : lower.includes("weekend")
      ? "Put weekend availability in your first sentence so planners commit sooner."
      : "Include at least two concrete time windows (for example: Tue evening, Sat morning).";

  const improvementNotes = [
    hasPrice ? "Pricing is clear enough for comparison." : "Add a clear price or price range students can scan.",
    hasCampusLocation
      ? "Location is campus-specific and easy to trust."
      : "Add a neighborhood (West Campus, North Campus, Guadalupe, or Riverside).",
    hasTiming
      ? "Availability language is concrete and bookable."
      : "Add timing words like tonight, tomorrow, or weekends to reduce back-and-forth.",
  ];

  return {
    title: inferTitle(category, lower),
    description: buildDescription(normalized, category, lower),
    category,
    tags,
    availabilityHint,
    improvementNotes,
  };
}
