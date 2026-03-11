#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

declare -A TARGETS=(
  ["ui"]="codex/agent-ui"
  ["data"]="codex/agent-data"
  ["ai"]="codex/agent-ai"
  ["qa"]="codex/agent-qa"
  ["demo"]="codex/agent-demo"
)

git -C "$ROOT_DIR" fetch --all --prune

for key in "${!TARGETS[@]}"; do
  path="$ROOT_DIR/worktrees/$key"
  branch="${TARGETS[$key]}"
  if [ -d "$path/.git" ] || [ -f "$path/.git" ]; then
    git -C "$path" checkout "$branch"
    git -C "$path" merge --ff-only main
  fi
done

echo "Agent worktrees synced to main."
