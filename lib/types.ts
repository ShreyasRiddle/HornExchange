export type Neighborhood =
  | "West Campus"
  | "North Campus"
  | "Guadalupe"
  | "Riverside"
  | "Downtown Austin";

export type ServiceCategory =
  | "Haircuts"
  | "Braiding"
  | "Tutoring"
  | "Photography"
  | "Resume Review"
  | "Moving Help";

export type AvailabilityWindow =
  | "Tonight"
  | "Tomorrow"
  | "This Week"
  | "Weekends"
  | "Flexible";

export type SearchPreference =
  | "Cheaper"
  | "Closer"
  | "More Trusted"
  | "Available Sooner"
  | "Not This Vibe";

export type SearchIntent = {
  rawQuery: string;
  category: ServiceCategory | "General";
  maxPrice?: number;
  location?: Neighborhood;
  timing?: AvailabilityWindow;
  qualityFocus?: "Budget" | "Trust" | "Speed";
  vibe?: "Polished" | "Casual" | "Premium";
  chips: string[];
  intentSource?: "ai" | "rules" | "fallback";
  classificationConfidence?: number;
};

export type Review = {
  author: string;
  rating: number;
  quote: string;
  avatarUrl?: string;
};

export type ServiceListing = {
  id: string;
  providerName: string;
  serviceTitle: string;
  category: ServiceCategory;
  price: number;
  priceUnit: string;
  neighborhood: Neighborhood;
  availability: AvailabilityWindow[];
  responseTime: string;
  bio: string;
  description: string;
  tags: string[];
  photos: string[];
  trustScore: number;
  rating: number;
  reviewCount: number;
  completedJobs: number;
  vibe: "Casual" | "Polished" | "Premium";
  recentMomentum: string;
  schedule: string[];
  reviews: Review[];
};

export type RankedRecommendation = ServiceListing & {
  matchScore: number;
  reason: string;
};

export type SearchResult = {
  intent: SearchIntent;
  recommendations: RankedRecommendation[];
};

export type ListingAssistResponse = {
  title: string;
  description: string;
  category: ServiceCategory;
  tags: string[];
  availabilityHint: string;
  improvementNotes: string[];
};

export type MessageAssistResponse = {
  buyerOpeners: string[];
  sellerReplies: string[];
};

export type Message = {
  id: string;
  listingId: string;
  sender: "buyer" | "seller";
  body: string;
  timestamp: string;
};
