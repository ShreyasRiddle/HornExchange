"use client";

import { Message, RankedRecommendation, SearchResult } from "@/lib/types";

export const storageKeys = {
  session: "hx-session",
  query: "hx-query",
  search: "hx-search-result",
  deckIndex: "hx-deck-index",
  saved: "hx-saved",
  bookings: "hx-bookings",
  threads: "hx-threads",
  activeListing: "hx-active-listing",
  promptHistory: "hx-prompt-history",
} as const;

const allStorageKeys = Object.values(storageKeys);

export type SessionState = {
  email: string;
  verified: boolean;
};

export type BookingMap = Record<string, string>;
export type ThreadMap = Record<string, Message[]>;

const defaultSession: SessionState = {
  email: "",
  verified: false,
};

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJSON<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function readSession() {
  return readJSON(storageKeys.session, defaultSession);
}

export function writeSession(session: SessionState) {
  writeJSON(storageKeys.session, session);
}

export function readQuery() {
  return readJSON(storageKeys.query, "");
}

export function writeQuery(query: string) {
  writeJSON(storageKeys.query, query);
}

export function readSearchResult() {
  return readJSON<SearchResult | null>(storageKeys.search, null);
}

export function writeSearchResult(result: SearchResult | null) {
  writeJSON(storageKeys.search, result);
}

export function readDeckIndex() {
  return readJSON(storageKeys.deckIndex, 0);
}

export function writeDeckIndex(index: number) {
  writeJSON(storageKeys.deckIndex, index);
}

export function readSaved() {
  return readJSON<RankedRecommendation[]>(storageKeys.saved, []);
}

export function writeSaved(saved: RankedRecommendation[]) {
  writeJSON(storageKeys.saved, saved);
}

export function readBookings() {
  return readJSON<BookingMap>(storageKeys.bookings, {});
}

export function writeBookings(bookings: BookingMap) {
  writeJSON(storageKeys.bookings, bookings);
}

export function readThreads() {
  return readJSON<ThreadMap>(storageKeys.threads, {});
}

export function writeThreads(threads: ThreadMap) {
  writeJSON(storageKeys.threads, threads);
}

export function readActiveListing() {
  return readJSON<string | null>(storageKeys.activeListing, null);
}

export function writeActiveListing(listingId: string | null) {
  if (typeof window === "undefined") return;
  if (listingId) {
    window.localStorage.setItem(storageKeys.activeListing, JSON.stringify(listingId));
    return;
  }
  window.localStorage.removeItem(storageKeys.activeListing);
}

export function readPromptHistory() {
  return readJSON<string[]>(storageKeys.promptHistory, []);
}

export function appendPromptHistory(prompt: string) {
  const trimmed = prompt.trim();
  if (!trimmed) return;
  const previous = readPromptHistory();
  const deduped = [trimmed, ...previous.filter((entry) => entry !== trimmed)];
  writeJSON(storageKeys.promptHistory, deduped.slice(0, 20));
}

export function clearClientState() {
  if (typeof window === "undefined") return;
  for (const key of allStorageKeys) {
    window.localStorage.removeItem(key);
  }
}
