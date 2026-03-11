import { MessageAssistResponse, ServiceListing } from "@/lib/types";

export function buildMessageAssist(
  listing: ServiceListing,
): MessageAssistResponse {
  return {
    buyerOpeners: [
      `Hey ${listing.providerName.split(" ")[0]}! I found your ${listing.category.toLowerCase()} listing and I’m interested in ${listing.schedule[0].toLowerCase()}. Is that still open?`,
      `Hi! I’m looking for ${listing.category.toLowerCase()} near ${listing.neighborhood}. Your profile feels like the best fit. Could we talk timing?`,
      `Hey, I like your reviews and trust score. What should I know before booking your ${listing.serviceTitle.toLowerCase()} service?`,
    ],
    sellerReplies: [
      `Yep, ${listing.schedule[0]} is still open. If that works for you, I can lock it in.`,
      `Absolutely. Most students book me for a quick turnaround, so I can send over the details and what to bring.`,
      `Happy to help. Tell me your preferred time and I’ll suggest the smoothest option on my schedule.`,
    ],
  };
}
