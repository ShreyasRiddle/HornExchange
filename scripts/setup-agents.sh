#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
WORKTREE_ROOT="$ROOT_DIR/worktrees"
BASE_BRANCH="${1:-main}"

declare -a AGENTS=(
  "ui:codex/agent-ui"
  "data:codex/agent-data"
  "ai:codex/agent-ai"
  "qa:codex/agent-qa"
  "demo:codex/agent-demo"
)

mkdir -p "$WORKTREE_ROOT"

for entry in "${AGENTS[@]}"; do
  name="${entry%%:*}"
  branch="${entry##*:}"
  path="$WORKTREE_ROOT/$name"

  if git show-ref --verify --quiet "refs/heads/$branch"; then
    git worktree add "$path" "$branch"
  else
    git worktree add "$path" -b "$branch" "$BASE_BRANCH"
  fi
done

cat <<EOF
Worktrees created under: $WORKTREE_ROOT

Open a Codex session in each directory:
- $WORKTREE_ROOT/ui
- $WORKTREE_ROOT/data
- $WORKTREE_ROOT/ai
- $WORKTREE_ROOT/qa
- $WORKTREE_ROOT/demo
EOF
