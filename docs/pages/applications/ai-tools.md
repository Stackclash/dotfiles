---
title: AI Tools
---

# AI Skills, Agents & MCPs

AI tooling for Claude Code and GitHub Copilot is managed the same way apps
are: declaratively, from a `.chezmoidata` file, applied by `run_onchange`
scripts.

---

## File Structure

```
home/.chezmoidata/
└── ai-tools.yaml

home/.chezmoiscripts/{Darwin,Windows}/
├── run_onchange_04-install-plugin-marketplaces.{sh,ps1}.tmpl
├── run_onchange_05-install-mcp-servers.{sh,ps1}.tmpl
└── run_onchange_06-install-npm-globals.{sh,ps1}.tmpl

home/.chezmoitemplates/
└── vscode-mcp-servers

home/AppData/Roaming/Code/User/mcp.json.tmpl
home/private_Library/private_Application Support/private_Code/User/mcp.json.tmpl

home/dot_claude/
├── skills/   # -> ~/.claude/skills/<name>/SKILL.md
└── agents/   # -> ~/.claude/agents/<name>.md
```

---

## `ai-tools.yaml`

Three top-level sections:

| Key | Purpose | Installed via |
|-----|---------|----------------|
| `pluginMarketplaces` | Plugin marketplaces + plugins, for Claude Code and/or the Copilot CLI | `<cli> plugin marketplace add` / `<cli> plugin install`, run against whichever of `claude`/`copilot` are on PATH |
| `mcpServers` | MCP servers, shared by Claude Code and VS Code/Copilot | `claude mcp add --scope user` **and** `~/.../Code/User/mcp.json` |
| `npmGlobal` | Global npm CLI tools | `npm install -g` |

An MCP server entry can declare `apiKeyFlag` + `apiKeyVar` to append a CLI
flag from a chezmoi data value (typically a `promptStringOnce` secret) only
when that value is non-empty — see the `context7` entry, which reads
`.context7ApiKey`.

Editing `ai-tools.yaml` and running `chezmoi apply` re-runs the relevant
`run_onchange` scripts, same as `apps.yaml`.

---

## Currently Installed

- **[Superpowers](https://github.com/obra/superpowers)** — TDD/planning/review skills library, installed as a plugin for both Claude Code and the Copilot CLI.
- **[Playwright MCP](https://github.com/microsoft/playwright-mcp)** — browser automation MCP server.
- **[Context7](https://github.com/upstash/context7)** — up-to-date library docs MCP server (optional API key via `.context7ApiKey`).
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — spec-driven development CLI (`@fission-ai/openspec`), installed globally via npm. It has no machine-wide config: run `openspec init` inside each project you want to use it in and pick your AI tool (Claude Code, Copilot, etc.) when prompted.

---

## Adding an MCP Server

1. Add an entry under `aiTools.mcpServers` in `ai-tools.yaml` with `command` and `args`.
2. Run `chezmoi apply` — it registers the server for Claude Code (`claude mcp add --scope user`) and regenerates VS Code's `mcp.json`.

## Adding a Plugin Marketplace

1. Add an entry under `aiTools.pluginMarketplaces` with the plugin's `marketplace` (owner/repo) and `plugin` (`name@marketplace`).
2. Run `chezmoi apply` — it installs the plugin for whichever of the `claude`/`copilot` CLIs are present.

## Adding a Custom Skill or Agent

Personal (non-third-party) skills and agents live directly under
`home/dot_claude/skills/` and `home/dot_claude/agents/` — see the `README.md`
in each for the expected format. These are Claude Code-only; GitHub Copilot
has no equivalent user-level mechanism (its plugins, above, are the
exception).
