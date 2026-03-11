import {
  ListingAssistResponse,
  MessageAssistResponse,
  SearchPreference,
  SearchResult,
} from "@/lib/types";

export const searchPreferences = [
  "Cheaper",
  "Closer",
  "More Trusted",
  "Available Sooner",
  "Not This Vibe",
] as const;

export type AiErrorResponse = {
  error: string;
};

export type AiSearchRequest = {
  query: string;
};

export type AiSearchResponse = SearchResult;

export type AiRefineRequest = {
  query: string;
  preference: SearchPreference;
};

export type AiRefineResponse = SearchResult;

export type AiGenerateListingRequest = {
  input: string;
};

export type AiGenerateListingResponse = ListingAssistResponse;

export type AiMessageAssistRequest = {
  listingId: string;
};

export type AiMessageAssistResponse = MessageAssistResponse;

export function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

export function isSearchPreference(value: unknown): value is SearchPreference {
  return typeof value === "string" && searchPreferences.includes(value as SearchPreference);
}
