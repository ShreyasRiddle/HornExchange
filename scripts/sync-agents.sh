#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

TARGETS=(
  "ui:codex/agent-ui"
  "data:codex/agent-data"
  "ai:codex/agent-ai"
  "qa:codex/agent-qa"
  "demo:codex/agent-demo"
)

git -C "$ROOT_DIR" fetch --all --prune

for entry in "${TARGETS[@]}"; do
  key="${entry%%:*}"
  branch="${entry##*:}"
  path="$ROOT_DIR/worktrees/$key"
  if [ -d "$path/.git" ] || [ -f "$path/.git" ]; then
    git -C "$path" checkout "$branch"
    git -C "$path" merge --ff-only main
  fi
done

echo "Agent worktrees synced to main."
