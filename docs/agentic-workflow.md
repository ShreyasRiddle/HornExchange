# HornExchange Agentic Workflow

This repository is set up for parallel Codex execution using git worktrees.

## Two-device ownership

- Device 1 (Shreyas): backend + orchestrator
- Device 2 (Dhruv): frontend

## Agent Streams

- Device 2 owns:
  - `ui` (`codex/agent-ui`): prompt-first UX, swipe deck, shortlist, messaging surface, visual polish.
  - `qa` (`codex/agent-qa`): integration checks, acceptance script, failure mode hardening.
  - `demo` (`codex/agent-demo`): README, judging artifacts, presentation narrative and demo script.
- Device 1 owns:
  - `data` (`codex/agent-data`): Supabase schema, UT auth gate logic, seed data realism, DB contracts.
  - `ai` (`codex/agent-ai`): search intent parsing, ranking logic, listing assistant, messaging assistant.
  - `main`: merge orchestration only.

## One-command setup

```bash
bash scripts/setup-agents.sh
```

This creates `worktrees/` with one folder per agent branch.

## Shared behavior contract (both devices)

These rules are mandatory to keep both devices aligned:

1. Never implement features directly on `main`.
2. Never edit another stream's branch unless ownership was explicitly reassigned.
3. Never rewrite history during active collab (`amend`, force-push, rebase).
4. Sync before each work block: `bash scripts/sync-agents.sh`.
5. Run checks before every push:
   - `npm run lint`
   - `npm run build`
6. Log all contract changes, assumptions, blockers in `docs/handoff-notes.md`.
7. If API contract changes are unavoidable, freeze the new shape, log exact field deltas, and notify the other device before merge.
8. Use small checkpoints and push frequently (every 60-90 minutes).

## Work block command pattern (both devices)

```bash
git checkout <owned-branch>
bash scripts/sync-agents.sh
# implement scoped changes
npm run lint
npm run build
git add -A
git commit -m "<scoped message>"
git push -u origin <owned-branch>   # first push
git push                            # next pushes
```

## Merge train (Device 1 only)

Use fast-forward-only merge order on `main`:

1. `codex/agent-data`
2. `codex/agent-ai`
3. `codex/agent-ui`
4. `codex/agent-qa`
5. `codex/agent-demo`

Run:

```bash
bash scripts/merge-train.sh
```

If any `--ff-only` step fails, stop and fix in the owning branch.

## How to run in Codex UI

1. Open one Codex session/tab per worktree folder.
2. Paste the matching master prompt:
   - Device 1: `docs/master-prompt-device1.md`
   - Device 2: `docs/master-prompt-device2.md`
3. In every session, begin by explicitly instructing Codex to follow `skills/hornexchange-builder/SKILL.md`.

## Handoff discipline

- Append one handoff block per checkpoint in `docs/handoff-notes.md`.
- Required fields:
  - completed
  - contracts touched
  - assumptions
  - blockers
