# UT Verification Assumptions

Last updated: 2026-03-10

This project models a UT-only services marketplace. The following assumptions are enforced and/or documented for implementation consistency.

## Data-layer assumptions

In `supabase/schema.sql`:

- A profile can only be marked `verified_ut = true` if `email` ends with `@utexas.edu`.
- `profiles.neighborhood` must be one of:
  - `West Campus`
  - `North Campus`
  - `Guadalupe`
  - `Riverside`
  - `Downtown Austin`
- Listing dimensions are constrained to app enums:
  - categories: `Haircuts`, `Braiding`, `Tutoring`, `Photography`, `Resume Review`, `Moving Help`
  - availability windows: `Tonight`, `Tomorrow`, `This Week`, `Weekends`, `Flexible`
  - vibe: `Casual`, `Polished`, `Premium`

## Product assumptions

- Marketplace browsing/search/swipe flows are intended for verified UT users.
- Demo seed data in `supabase/seed.sql` uses verified `@utexas.edu` accounts for all active profiles.
- Non-UT emails may exist only as unverified profiles during onboarding; they should not be treated as fully activated marketplace identities.

## Coordination notes

- If UT domain policy changes, update both `supabase/schema.sql` and this doc in the same change.
- If additional schools/domains are introduced, treat that as a contract change and log field-level deltas in `docs/handoff-notes.md`.
