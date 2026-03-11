# HornExchange AI

UT-exclusive campus concierge prototype for student services at UT Austin.

Core v1 flow:

- Prompt-first natural-language search
- Swipe recommendation deck (left skip, right save)
- Saved shortlist with schedule selection
- AI-assisted messaging openers/replies
- Seller listing copilot

## Local run

```bash
npm install
npm run dev
```

App URL: `http://localhost:3000`

## API routes

- `POST /api/ai/search` -> parse query + rank recommendations
- `POST /api/ai/refine` -> rerank from refinement chip
- `POST /api/ai/generate-listing` -> seller listing draft assist
- `POST /api/ai/message-assist` -> buyer opener and seller reply suggestions

## Multi-agent workflow (Codex)

One-command worktree setup:

```bash
bash scripts/setup-agents.sh
```

This creates:

- `worktrees/ui`
- `worktrees/data`
- `worktrees/ai`
- `worktrees/qa`
- `worktrees/demo`

Open one Codex session per worktree and assign ownership by stream.

Detailed instructions: `docs/agentic-workflow.md`

Device-specific master prompts:

- Device 1 (Shreyas): `docs/master-prompt-device1.md`
- Device 2 (Dhruv): `docs/master-prompt-device2.md`

Orchestrator merge command:

```bash
bash scripts/merge-train.sh
```

## Custom skill

Project skill: `skills/hornexchange-builder/SKILL.md`

Use it in every stream to keep product scope, UX behavior, ranking logic, and demo acceptance consistent.

## Supabase artifacts

- Schema: `supabase/schema.sql`
- Seed starter rows: `supabase/seed.sql`

## QA and judging docs

- Demo checklist: `docs/qa-checklist.md`
- Codex judging narrative: `docs/judging-story.md`
- Stream handoff log: `docs/handoff-notes.md`
