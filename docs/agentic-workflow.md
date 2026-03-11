# HornExchange Agentic Workflow

This repository is set up for parallel Codex execution using git worktrees.

## Agent Streams

- `ui` (`codex/agent-ui`): prompt-first UX, swipe deck, shortlist, messaging surface, visual polish.
- `data` (`codex/agent-data`): Supabase schema, UT auth gate logic, seed data realism, DB contracts.
- `ai` (`codex/agent-ai`): search intent parsing, ranking logic, listing assistant, messaging assistant.
- `qa` (`codex/agent-qa`): integration checks, acceptance script, failure mode hardening.
- `demo` (`codex/agent-demo`): README, judging artifacts, presentation narrative and demo script.

## One-command setup

```bash
bash scripts/setup-agents.sh
```

This creates `worktrees/` with one folder per agent branch.

## How to run in the UI

1. Open one Codex session/tab per worktree folder.
2. Give each session only its stream objective and acceptance criteria.
3. Keep API contracts stable between `ui`, `data`, and `ai`.
4. Merge streams in this order:
   1. `data` + `ai`
   2. `ui`
   3. `qa`
   4. `demo`

## Merge discipline

- Small PR-sized commits per stream.
- Do not change another stream's ownership zone without explicit coordination.
- Document unresolved assumptions in commit messages or `docs/handoff-notes.md`.
