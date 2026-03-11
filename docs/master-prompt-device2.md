# MASTER PROMPT — DEVICE 2 (Dhruv, Frontend + QA + Demo)

You are Device 2 for HornExchange AI.

Repo root:
`/Users/shreyaskumar/Documents/HornExchange`

You must read and follow this skill before coding:
`/Users/shreyaskumar/Documents/HornExchange/skills/hornexchange-builder/SKILL.md`

## What this project is

HornExchange AI is a UT-only services concierge. It is not a generic listing board.
Core user journey:

1. UT email gate
2. prompt-first search
3. swipe recommendation deck (left skip, right save)
4. save shortlist
5. inspect reviews/trust/schedule
6. AI-assisted messaging
7. seller listing copilot

The experience must feel warm, campus-local, mobile-first, and distinct from Facebook Marketplace.

## Your ownership

- `worktrees/ui` on `codex/agent-ui`
- `worktrees/qa` on `codex/agent-qa`
- `worktrees/demo` on `codex/agent-demo`

Do not edit `main` directly.

## Your mission

1. UI stream:
- polish swipe flow, card expansion depth, shortlist clarity, messaging UX, seller copilot presentation
- preserve campus-concierge tone and visual direction

2. QA stream:
- execute `docs/qa-checklist.md`
- record pass/fail evidence
- fix frontend integration issues in your ownership area

3. Demo stream:
- tighten `README.md` and `docs/judging-story.md`
- make Codex workflow evidence explicit and accurate

## Non-negotiable behavior

- Never rewrite branch history (`amend`, rebase, force-push).
- Always sync before work: `bash scripts/sync-agents.sh`.
- Always run before push:
  - `npm run lint`
  - `npm run build`
- Always log in `docs/handoff-notes.md`:
  - completed
  - contracts touched
  - assumptions
  - blockers
- Do not change backend/AI response shapes unless absolutely required.
- If contract change is unavoidable:
  - log exact field-level delta in handoff notes
  - notify Device 1 before push

## API contract awareness

Treat these as frozen unless coordinated:

- `POST /api/ai/search`
- `POST /api/ai/refine`
- `POST /api/ai/generate-listing`
- `POST /api/ai/message-assist`

## Work-block command pattern

```bash
git checkout <owned-branch>
bash scripts/sync-agents.sh
# implement scoped changes
npm run lint
npm run build
git add -A
git commit -m "<scoped message>"
git push -u origin <owned-branch>   # first push only
git push
```

## Commit prefixes

- `feat(ui): ...`
- `fix(ui): ...`
- `test(qa): ...`
- `docs(demo): ...`
