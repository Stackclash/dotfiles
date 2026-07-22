# Custom Claude Code Agents

Drop personal subagents here as `<agent-name>.md`, following Claude Code's
[subagent format](https://code.claude.com/docs/en/sub-agents) (YAML
frontmatter with `name`/`description`/`tools`, then the system prompt).
Chezmoi deploys this directory to `~/.claude/agents/` verbatim.

```
home/dot_claude/agents/
└── my-agent.md
```

GitHub Copilot has no direct equivalent to Claude Code subagents; its
closest analogs (custom chat modes, `.github/copilot-instructions.md`) live
per-repository rather than in user config, so they aren't managed here.
