# Layout Reference

## Source of truth

- `agent-pack/core/pack.json`: pack metadata
- `agent-pack/core/commands/*.json`: user-facing command definitions
- `agent-pack/core/agents/*.json`: role definitions
- `agent-pack/core/policies/*.md`: shared operating rules
- `agent-pack/core/skills/*`: reusable skill content
- `agent-pack/mcp/registry.json`: external tool registry

## Generated outputs

- `CLAUDE.md`: Claude Code repository entrypoint
- `.claude/commands/*.md`: Claude Code command prompts
- `.claude/agents/*.md`: Claude Code subagent prompts
- `.claude/skills/*`: Claude Code project-local skills
- `AGENTS.md`: Codex-facing repository instructions
- `agent-pack/dist/claude/*`: helper manifests for Claude wiring
- `agent-pack/dist/codex/*`: helper manifests for Codex wiring
