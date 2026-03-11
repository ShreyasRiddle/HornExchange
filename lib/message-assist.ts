import { MessageAssistResponse, ServiceListing } from "@/lib/types";

function firstName(fullName: string) {
  return fullName.split(" ")[0] ?? "there";
}

export function buildMessageAssist(
  listing: ServiceListing,
): MessageAssistResponse {
  const provider = firstName(listing.providerName);
  const primarySlot = listing.schedule[0] ?? "a time this week";

  return {
    buyerOpeners: [
      `Hey ${provider}, I’m a UT student and your ${listing.category.toLowerCase()} listing looks like a fit. Is ${primarySlot.toLowerCase()} still open?`,
      `Hi ${provider}! I’m near ${listing.neighborhood} and want to book your ${listing.serviceTitle.toLowerCase()}. Could you confirm pricing and the soonest slot?`,
      `Hey, your trust score and reviews stood out to me. If I share what I need, can you suggest the best appointment option?`,
    ],
    sellerReplies: [
      `Yes, ${primarySlot} is open. If you want it, I can hold it and share exact next steps.`,
      `Happy to help. Share your timing and what outcome you want, and I’ll recommend the smoothest option on my schedule.`,
      `Absolutely. Once you confirm your preferred slot, I’ll send location details and prep notes so booking is easy.`,
    ],
  };
}
