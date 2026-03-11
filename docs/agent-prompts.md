# Agent Prompts (Paste into each Codex session)

## UI stream (`worktrees/ui`)

Implement and polish the HornExchange buyer and seller interfaces only. Preserve the prompt-first search, swipe deck behavior, saved shortlist, messaging surface, and warm campus visual direction. Do not change backend API contracts without documenting them in `docs/handoff-notes.md`.

## Data stream (`worktrees/data`)

Implement Supabase schema and seed realism for profiles, service listings, reviews, threads/messages, and saved recommendations. Enforce UT-only email gating assumptions. Keep contracts compatible with current API response shapes and document changes in `docs/handoff-notes.md`.

## AI stream (`worktrees/ai`)

Improve search intent parsing, deterministic ranking, refinement behavior, listing drafting, and message suggestion quality. Ensure explanations map to actual ranking factors. Keep APIs stable or document exact contract deltas in `docs/handoff-notes.md`.

## QA stream (`worktrees/qa`)

Run integration checks across search, deck actions, shortlist, messaging, and listing copilot. Update `docs/qa-checklist.md` with pass/fail evidence. Log breakpoints and fixes in `docs/handoff-notes.md`.

## Demo stream (`worktrees/demo`)

Refine README, judging story, and demo script. Make sure the Codex narrative clearly shows worktrees, parallel streams, and custom skill usage. Keep claims evidence-based and aligned to the implemented flow.
