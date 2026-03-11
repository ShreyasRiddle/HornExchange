# Handoff Notes

Use this file for short stream handoffs during multi-agent execution.

Template:

```
## [agent-name] YYYY-MM-DD HH:MM
- Completed:
- Contracts touched:
- Assumptions:
- Open issues:
```

<<<<<<< HEAD
## [agent-ai] 2026-03-10 21:10 CDT
- Completed: Improved intent parsing coverage (budget/location/timing/quality cues), refactored deterministic weighted ranking + tie-break logic, aligned "why this match" reasons to actual scored factors, and upgraded listing/message assist draft quality while preserving API response shapes.
- Contracts touched: Internal ranking/reasoning behavior in `lib/search.ts`; assist copy generation in `lib/listing-assist.ts` and `lib/message-assist.ts`. No API schema changes to `/api/ai/search`, `/api/ai/refine`, `/api/ai/generate-listing`, `/api/ai/message-assist`.
- Assumptions: `refine` "Closer" preference remains a deterministic neighborhood-priority reorder without per-user geolocation; existing `SearchIntent` and endpoint response fields are contract-frozen.
- Open issues: None.
=======
## [codex-agent-data] 2026-03-10 21:12 CDT
- Completed:
  - Finalized `supabase/schema.sql` constraints to align with app enums (category/neighborhood/availability/vibe), trust/rating bounds, and UT verification rule (`verified_ut` requires `@utexas.edu`).
  - Expanded `supabase/seed.sql` to realistic multi-table demo data aligned with current app models: 7 profiles, 6 listings, 18 reviews, 2 threads, 3 messages, 2 saved recommendations.
  - Added `lib/api-contracts.ts` and wired `/api/ai/search`, `/api/ai/refine`, `/api/ai/generate-listing`, `/api/ai/message-assist` to shared request/response typing plus runtime validation for stable contracts.
  - Added contract documentation: `docs/contracts/ai-api-contracts.md` and `docs/contracts/ut-verification.md`.
- Contracts touched:
  - `POST /api/ai/search`: unchanged success shape; explicit 400 validation contract documented and typed.
  - `POST /api/ai/refine`: unchanged success shape; now enforces enum-only `preference` and returns 400 for invalid values.
  - `POST /api/ai/generate-listing`: unchanged success shape; explicit non-empty `input` validation documented and typed.
  - `POST /api/ai/message-assist`: unchanged success shape; now distinguishes missing `listingId` (400) from unknown listing (404).
  - Supabase data contract: constrained enums and UT verification assumption documented.
- Assumptions:
  - API stability requirement allows stricter validation and error semantics without changing successful response payload shapes.
  - Non-UT profiles may exist only in unverified onboarding states; marketplace-active identities remain UT-verified.
- Blockers:
  - None.
>>>>>>> origin/main
