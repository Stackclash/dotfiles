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
├── run_onchange_06-install-cli-skills.{sh,ps1}.tmpl
└── run_onchange_07-install-remote-skills.{sh,ps1}.tmpl

home/.chezmoitemplates/
└── vscode-mcp-servers

home/AppData/Roaming/Code/User/mcp.json.tmpl
home/private_Library/private_Application Support/private_Code/User/mcp.json.tmpl

home/dot_claude/
├── skills/   # -> ~/.claude/skills/<name>/SKILL.md
└── agents/   # -> ~/.claude/agents/<name>.md

home/dot_config/mise/config.toml   # AI-adjacent CLI tools (e.g. OpenSpec) via mise's npm backend
```

---

## `ai-tools.yaml`

Four top-level sections:

| Key | Purpose | Installed via |
|-----|---------|----------------|
| `pluginMarketplaces` | Plugin marketplaces + plugins | `<cli> plugin marketplace add` / `<cli> plugin install`, for whichever of `claude`/`copilot` are on PATH |
| `mcpServers` | MCP servers | `claude mcp add --scope user`, `copilot mcp add`, **and** VS Code/Copilot Chat's `~/.../Code/User/mcp.json` |
| `cliSkills` | Post-install registration for a CLI tool already installed via mise | `mise exec -- <command>` (e.g. `graphify install`) |
| `remoteSkills` | Individual third-party skills not distributed via a plugin marketplace | shallow `git clone` of the repo, copy of one subdirectory into `~/.claude/skills/<key>/` |

Both `pluginMarketplaces` and `mcpServers` entries accept an optional `clis`
list to restrict which CLI(s) they're registered against, e.g. `clis:
["claude"]` for something Claude Code-only. Omitting `clis` registers on
both `claude` and `copilot` (whichever are actually present) — this is the
default. `clis` only affects the two CLIs; an `mcpServers` entry is always
written to VS Code's `mcp.json` regardless, since that's a separate surface
(the VS Code Copilot Chat extension, not the standalone Copilot CLI).

An `mcpServers` entry can also declare `apiKeyFlag` + `apiKeyVar` to append a
CLI flag from a chezmoi data value (typically a `promptStringOnce` secret)
only when that value is non-empty — see the `context7` entry, which reads
`.context7ApiKey`.

A `cliSkills` entry just needs `command` (the full command to run, e.g.
`"graphify install"`). Its binary is expected to already be declared as a
mise tool in `home/dot_config/mise/config.toml`; the script runs the command
through `mise exec --` so it resolves even if mise's shims aren't on PATH in
that shell.

A `remoteSkills` entry needs `repo` (git URL) and `path` (the subdirectory
inside that repo containing the skill's `SKILL.md`); optional `ref` pins a
branch/tag. Each `chezmoi apply` re-clones and re-copies that one
subdirectory into `~/.claude/skills/<key>/`, overwriting whatever was there —
this is for skills that live loose inside someone's larger repo rather than
a proper plugin marketplace, so there's no versioning beyond `ref`.

Editing `ai-tools.yaml` and running `chezmoi apply` re-runs the relevant
`run_onchange` scripts, same as `apps.yaml`.

> [!NOTE]
> The `copilot mcp add` / `copilot mcp delete` syntax is based on current
> GitHub Copilot CLI docs, not hands-on verification against the binary —
> if GitHub changes the flags, `run_onchange_05-install-mcp-servers` will
> need a matching update. Likewise, the `openspec-superpowers-workflow`
> plugin's marketplace name (`scl-claude-plugins`) comes from secondhand
> sources, not a direct read of that repo's `marketplace.json` — worth a
> quick check if `claude plugin install` reports it can't find the plugin.

---

## Currently Installed

- **[Superpowers](https://github.com/obra/superpowers)** — TDD/planning/review skills library, installed as a plugin for both Claude Code and the Copilot CLI.
- **[openspec-superpowers-workflow](https://github.com/chinlung/claude-dev-workflow/tree/main/plugins/openspec-superpowers-workflow)** — a workflow plugin combining OpenSpec's spec-gated phases with Superpowers' skills, pinned to a specific commit of its marketplace repo.
- **[Playwright MCP](https://github.com/microsoft/playwright-mcp)** — browser automation MCP server.
- **[Context7](https://github.com/upstash/context7)** — up-to-date library docs MCP server (optional API key via `.context7ApiKey`).
- **[OpenSpec](https://github.com/Fission-AI/OpenSpec)** — spec-driven development CLI (`@fission-ai/openspec`), installed via mise's npm backend (`home/dot_config/mise/config.toml`). It has no machine-wide config: run `openspec init` inside each project you want to use it in and pick your AI tool (Claude Code, Copilot, etc.) when prompted.
- **[Graphify](https://github.com/Graphify-Labs/graphify)** — turns a codebase into a queryable knowledge graph via a `/graphify` skill. Installed via mise's pipx backend (`pipx:graphifyy`) plus a one-time `graphify install`, which auto-detects and registers the skill for whichever of Claude Code/Cursor/Copilot/Codex are present.
- **[nestjs-doctor](https://github.com/RoloBits/nestjs-doctor)** — diagnoses NestJS code, 0-100 health score. Installed globally via mise's npm backend (`npm:nestjs-doctor`) for convenience, but it's designed as a per-project devDependency: run `nestjs-doctor --init` inside each NestJS project to write that project's `.agents/nestjs-doctor/` skill files and pin a project-local version for CI score gates.
- **[read-bin-docs](https://github.com/YPares/agent-skills/tree/main/read-bin-docs)** — PDF text extraction skill, one of several loose skills in YPares' `agent-skills` repo (no marketplace of its own), so it's fetched as a `remoteSkills` entry instead.

---

## Adding an MCP Server

1. Add an entry under `aiTools.mcpServers` in `ai-tools.yaml` with `command` and `args` (and optionally `clis`).
2. Run `chezmoi apply` — it registers the server for Claude Code and/or the Copilot CLI (per `clis`) and regenerates VS Code's `mcp.json`.

## Adding a Plugin Marketplace

1. Add an entry under `aiTools.pluginMarketplaces` with the plugin's `marketplace` (owner/repo) and `plugin` (`name@marketplace`). Add `clis: ["claude"]` or `clis: ["copilot"]` if the plugin only supports one of the two; omit it if it supports both.
2. Run `chezmoi apply` — it installs the plugin for whichever of the `claude`/`copilot` CLIs are present (intersected with `clis`, if set).

## Adding a Custom Skill or Agent

Personal (non-third-party) skills and agents live directly under
`home/dot_claude/skills/` and `home/dot_claude/agents/` — see the `README.md`
in each for the expected format. These are Claude Code-only; GitHub Copilot
has no equivalent user-level mechanism (its plugins, above, are the
exception).

## Adding a Remote (Non-Marketplace) Skill

For a third-party skill that lives as a plain `SKILL.md` folder inside
someone's repo rather than behind a plugin marketplace: add an entry under
`aiTools.remoteSkills` with `repo` and `path` (and optional `ref`), then
`chezmoi apply` — `run_onchange_07-install-remote-skills` shallow-clones the
repo and copies just that subdirectory into `~/.claude/skills/<key>/`.

## Adding a Global AI-Adjacent CLI Tool

Prefer mise over a dedicated npm-install script: add the package under
`[tools]` in `home/dot_config/mise/config.toml` using mise's npm backend,
e.g. `"npm:some-package" = "latest"`, then run `chezmoi apply` (or `mise
install`).

If the tool also needs a one-time command to register itself as a skill
with AI assistants (like Graphify's `graphify install`), add it under
`aiTools.cliSkills` in `ai-tools.yaml` too and `chezmoi apply` will run it
via `run_onchange_06-install-cli-skills`.
