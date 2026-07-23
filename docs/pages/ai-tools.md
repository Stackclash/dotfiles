---
title: AI Tools
---

# AI Tools (`ai-tools.yaml`)

A data-driven workflow for adding and managing AI developer tools — MCP servers,
Claude/Copilot plugins, skills, agents, and package-manager CLIs — the same way
[`apps.yaml`](scripts.md) manages applications.

Everything is declared in **`home/.chezmoidata/ai-tools.yaml`**. Edit that file and
run `chezmoi apply` — nothing else needs touching.

## How it works

`chezmoi apply` does everything, in two ways:

| Mechanism | Handles |
|-----------|---------|
| **chezmoi templates** | package tools → mise config (`~/.config/mise/config.toml`); Copilot MCP servers → VS Code `mcp.json` (next to `settings.json`) |
| **`run_onchange_after_04-sync-ai-tools` script** (per-OS: PowerShell + bash) | imperative installs: Claude MCP registration, plugin installs, custom skill/agent copy, package post-install steps |

The sync script inlines the tool list from `ai-tools.yaml` at render time (like
`run_onchange_02-install-apps`), so it re-runs automatically whenever the data
changes. Every external command it runs is **best-effort**: if a CLI (`claude`,
`copilot`, …) isn't installed yet, it logs a follow-up note and moves on — a missing
tool never fails `chezmoi apply`.

## The schema

`aiTools` is organized by category — the key under `aiTools` tells you what
a tool is; there is no separate `type:` field.

```yaml
aiTools:
  mcp:     { <name>: {...} }
  plugin:  { <name>: {...} }
  package: { <name>: {...} }
  custom:  { <name>: {...} }
```

Every entry has an `assistant` (`claude`, `copilot`, or `both`) and,
optionally, `forPersonal: false` to skip it on work machines.

### `mcp` — MCP servers

Registered with **Claude** (user scope, via `claude mcp add-json`) and, for
`copilot`/`both`, written into the managed VS Code **`mcp.json`**. A single
`config:` dict is used verbatim as the server's JSON for both — any field
either tool's MCP schema supports just works.

```yaml
  mcp:
    playwright-mcp:
      assistant: both
      config:
        type: stdio
        command: npx
        args: ["@playwright/mcp@latest"]

    context7:
      assistant: both
      config:
        type: http
        url: "https://mcp.context7.com/mcp"
        headers:
          CONTEXT7_API_KEY: "{{ (dopplerProjectJson \"dotfiles\" \"prd\").CONTEXT7_API_KEY }}"
```

**Secrets**: any string inside `config:` containing `{{` is executed as a
real chezmoi template (via `chezmoi execute-template`) before being embedded
in the rendered JSON — not simple `{{ .key }}` substitution, so any chezmoi
template function works, including Doppler's. The Doppler CLI is already
mise-managed (`github:DopplerHQ/cli`); authenticate it once per machine
(`doppler login`, `doppler setup`) and reference secrets with
`{{ (dopplerProjectJson "<project>" "<config>").<SECRET_NAME> }}`. Remove a
`headers`/`env` entry entirely to run a server keyless.

### `package` — package-manager CLIs

Unchanged in shape, just relocated:

```yaml
  package:
    graphify:
      assistant: claude
      mise: { backend: pipx, package: graphifyy }
      postInstall: "graphify install"
```

### `plugin` — marketplace plugins

```yaml
  plugin:
    superpowers:
      assistant: both
      claude:  { marketplaceAdd: "anthropics/claude-plugins-official", install: "superpowers@claude-plugins-official" }
      copilot: { marketplaceAdd: "obra/superpowers-marketplace", install: "superpowers@superpowers-marketplace" }
```

### `custom` — your own skills and agents

```yaml
  custom:
    my-skill:
      assistant: both
      kind: skill        # skill | agent
```

Author the content once under the neutral source directory, then declare it:

```
home/dot_ai/skills/<name>/SKILL.md     ->  ~/.ai/skills/<name>/
home/dot_ai/agents/<name>/             ->  ~/.ai/agents/<name>/
```

The sync script **copies** it into each assistant's location (copy, not
symlink — so it works on Windows without Developer Mode):

| kind | Claude | Copilot |
|------|--------|---------|
| skill | `~/.claude/skills/<name>` | `~/.agents/skills/<name>` (+ registered in the Copilot skills manifest if present) |
| agent | `~/.claude/agents/<name>` | — (Copilot agents are extension-defined) |

## Running it

```bash
chezmoi apply    # renders configs + runs the sync when ai-tools.yaml changes
```

To force a re-sync without changing the data (e.g. to pick up latest plugin/package
versions), re-run all onchange scripts:

```bash
chezmoi apply --force
```

Verify:

```bash
claude mcp list          # playwright + context7 registered
mise ls                  # graphifyy + @fission-ai/openspec present
```

## Starter tools

| Tool | Type | Assistant | Notes |
|------|------|-----------|-------|
| playwright-mcp | mcp | both | browser automation |
| context7 | mcp | both | docs lookup; optional API key |
| superpowers | plugin | both | skills/workflow bundle |
| graphify | package (pipx) | claude | `graphify install` post-step |
| openspec | package (npm) | both | per-repo `openspec init` |
