# Host Mapping Reference

## Claude Code

- Render repository-wide operating guidance into `CLAUDE.md`.
- Map each command definition to one Markdown file in `.claude/commands/`.
- Map each agent definition to one Markdown file in `.claude/agents/`.
- Mirror each shared skill into `.claude/skills/` so the project carries its own local skills.
- Keep local machine permissions in `.claude/settings.local.json`, not in generated files.

## Codex

- Render repository-wide operating guidance into `AGENTS.md`.
- Reference source skill paths directly instead of duplicating skill bodies into generated output.
- Keep Codex-specific helper manifests in `agent-pack/dist/codex/` so the root instructions stay readable.
