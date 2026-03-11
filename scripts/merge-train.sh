#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

MERGE_ORDER=(
  "codex/agent-data"
  "codex/agent-ai"
  "codex/agent-ui"
  "codex/agent-qa"
  "codex/agent-demo"
)

git -C "$ROOT_DIR" checkout main
git -C "$ROOT_DIR" pull --ff-only origin main

for branch in "${MERGE_ORDER[@]}"; do
  git -C "$ROOT_DIR" fetch origin "$branch"
  git -C "$ROOT_DIR" merge --ff-only "origin/$branch"
done

(cd "$ROOT_DIR" && npm run lint)
(cd "$ROOT_DIR" && npm run build)
git -C "$ROOT_DIR" push origin main

echo "Merge train complete: main is updated and verified."
