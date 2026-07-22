# Custom Claude Code Skills

Drop personal skills here as `<skill-name>/SKILL.md` (plus any supporting
files in the same folder). Chezmoi deploys this directory to `~/.claude/skills/`
verbatim — nothing here is templated or generated, so a skill just needs to
follow Claude Code's [skill format](https://code.claude.com/docs/en/skills).

```
home/dot_claude/skills/
└── my-skill/
    └── SKILL.md
```

This is separate from the installable, third-party tooling declared in
`home/.chezmoidata/ai-tools.yaml` (MCP servers, npm globals, Claude Code
plugins) — see `docs/pages/applications/ai-tools.md`. Skills placed here are
yours; nothing gets removed automatically if you delete a folder from this
repo and re-apply, since `dot_claude` is a regular (non-exact) chezmoi
directory — Claude Code's own state files under `~/.claude/` are left alone.
