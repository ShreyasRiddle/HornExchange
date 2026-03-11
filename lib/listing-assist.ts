import { ListingAssistResponse, ServiceCategory } from "@/lib/types";

const categoryRules: Array<{ category: ServiceCategory; match: RegExp }> = [
  { category: "Haircuts", match: /hair|fade|trim|barber/i },
  { category: "Braiding", match: /braid|formal|style/i },
  { category: "Tutoring", match: /tutor|calc|physics|exam|class/i },
  { category: "Photography", match: /photo|grad|headshot|portrait/i },
  { category: "Resume Review", match: /resume|linkedin|internship/i },
  { category: "Moving Help", match: /move|truck|furniture|storage/i },
];

export function generateListingDraft(input: string): ListingAssistResponse {
  const trimmed = input.trim();
  const category =
    categoryRules.find(({ match }) => match.test(trimmed))?.category ?? "Tutoring";
  const normalized = trimmed.replace(/\s+/g, " ");
  const lower = normalized.toLowerCase();
  const title =
    category === "Haircuts"
      ? "UT Student Haircuts Near West Campus"
      : category === "Braiding"
        ? "Event-Ready Braids for UT Students"
        : category === "Tutoring"
          ? "Quick-Response UT Tutoring Sessions"
          : category === "Photography"
            ? "Campus Portraits and Headshots"
            : category === "Resume Review"
              ? "Resume Rescue Before Recruiting"
              : "Campus Move-Out and Haul Help";

  const description = `Built from your rough notes: ${normalized}. This listing now reads like a clear student service for UT buyers, with what you offer, who it is for, and why someone should trust you.`;

  const availabilityHint = lower.includes("tonight")
    ? "Highlight tonight availability to convert faster."
    : lower.includes("weekend")
      ? "Call out your weekend slots early in the card."
      : "Add one or two specific time windows to improve booking confidence.";

  const tags = [
    category.toLowerCase(),
    lower.includes("west campus") ? "west campus" : "ut students",
    lower.includes("cheap") || lower.includes("$20") ? "budget-friendly" : "trusted",
    "fast replies",
  ];

  const improvementNotes = [
    lower.match(/\$\d+/) ? "Pricing is clear enough for browsing." : "Add a clear price or price range.",
    lower.includes("west campus") || lower.includes("north campus")
      ? "Location feels campus-specific."
      : "Add a campus neighborhood like West Campus or North Campus.",
    lower.includes("tonight") || lower.includes("weekend") || lower.includes("tomorrow")
      ? "Availability is concrete."
      : "Add timing language so buyers know when you can help.",
  ];

  return {
    title,
    description,
    category,
    tags,
    availabilityHint,
    improvementNotes,
  };
}
