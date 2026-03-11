---
name: hornexchange-builder
description: Use this skill when building or updating HornExchange AI. It enforces the services-only UT campus concierge scope, swipe recommendation UX, ranking behavior, AI assist patterns, and demo acceptance criteria.
---

# HornExchange Builder

This skill keeps all implementation streams aligned to the same product.

## Product Contract

- Services-only marketplace for UT Austin students.
- Primary buyer flow: prompt-first search -> swipe recommendation deck -> save shortlist -> message provider.
- Core AI surfaces:
  - natural-language search interpretation
  - ranking explanations
  - seller listing drafting
  - messaging opener/reply suggestions
- No v1 expansion into payments, realtime chat, product resale, or admin dashboards.

## UX Constraints

- Must feel like a campus concierge, not a feed of classifieds.
- Use UT neighborhood language (West Campus, North Campus, Guadalupe).
- Recommendation card must show: provider, title, price, location, trust/rating, reason.
- Card supports rich expansion: reviews, provider bio, schedule, action buttons.
- Swipe semantics:
  - left = skip
  - right = save

## AI and Ranking Rules

- Parse user prompt into structured intent (category, budget, location, timing, quality).
- Rank with deterministic scoring across:
  - category relevance
  - price fit
  - location fit
  - availability fit
  - trust/rating
- "Why this match" copy must be generated from true ranking factors.
- Messaging AI is suggestive only; never auto-send.

## Data and Trust Rules

- Enforce UT email restriction in auth/onboarding flow.
- Trust score is deterministic and visible.
- Seed data must include variation in:
  - category
  - price
  - neighborhood
  - availability
  - trust/reviews

## Demo Acceptance

- End-to-end path works on mobile:
  - verify UT email
  - search with natural language
  - swipe and save
  - inspect details
  - send message
  - generate seller listing draft
- Keep one fallback prompt/query path ready in case the primary query underperforms.
