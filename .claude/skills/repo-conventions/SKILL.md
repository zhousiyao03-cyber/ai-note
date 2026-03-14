---
name: repo-conventions
description: Apply the shared conventions for this repository's cross-host agent pack. Use when adding or updating commands, subagents, skills, MCP registry entries, generator scripts, or host adapters for Claude Code and Codex.
---

# Repo Conventions

Keep host-agnostic intent in `agent-pack/core/`.

Treat `scripts/build-agent-pack.mjs` as the only generator for `.claude/` command and agent files, `AGENTS.md`, and `agent-pack/dist/`.

Edit generated files only to inspect output. Put lasting changes back into the source definitions and regenerate.

Keep commands orchestration-only. Put reusable workflow knowledge into skills and host-specific rendering rules into the generator.

Read `references/layout.md` when you need the folder responsibilities.

Read `references/host-mapping.md` when you need to adjust how a command or agent renders for Claude Code versus Codex.
