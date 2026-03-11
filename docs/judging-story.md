# Codex Judging Story

HornExchange AI was built as a Codex-native project:

1. We split implementation into five parallel streams (`ui`, `data`, `ai`, `qa`, `demo`) with git worktrees.
2. We created and reused a custom skill (`hornexchange-builder`) so every stream followed the same product constraints and quality bar.
3. We used deterministic ranking + model-style parsing patterns to keep AI behavior interpretable and demo-safe.
4. We validated the exact demo path with a dedicated acceptance checklist to reduce live-risk.

This lets us show judges not just the app, but an intentional multi-agent process that produced it.
