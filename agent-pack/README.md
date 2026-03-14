# Shared Agent Pack

This repository now contains a host-agnostic agent pack that can be rendered for both Claude Code and Codex.

## Layout

- `agent-pack/core/` contains the source of truth for commands, agents, skills, and policies.
- `agent-pack/mcp/registry.json` lists MCP servers that host adapters can wire up.
- `agent-pack/adapters/` describes where each host expects generated files.
- `agent-pack/dist/` contains generated manifests and host-specific helper output.
- `scripts/build-agent-pack.mjs` renders the generated files.
- `scripts/build-agent-pack.ps1` wraps the generator for Windows PowerShell sessions that cannot execute the `.mjs` entrypoint directly.

## Workflow

1. Edit or add definitions in `agent-pack/core/`.
2. Run `node scripts/build-agent-pack.mjs`.
   On constrained Windows environments, use `powershell -ExecutionPolicy Bypass -File scripts/build-agent-pack.ps1`.
3. Commit the updated source and generated outputs:
   - `CLAUDE.md`
   - `.claude/commands/*.md`
   - `.claude/agents/*.md`
   - `.claude/skills/**/*`
   - `AGENTS.md`
   - `agent-pack/dist/**/*`

## First-class resources

- Commands stay orchestration-only.
- Agents define role boundaries and handoff points.
- Skills store reusable guidance and references.
- MCP entries stay registry-based so both hosts can map them differently.

## Adding a new capability

1. Add a command JSON file in `agent-pack/core/commands/`.
2. Add or update the agent JSON files it depends on.
3. Add a skill only if the workflow needs reusable knowledge or assets.
4. Add an MCP registry entry only when the capability truly needs an external tool.
5. Re-run the build script.
