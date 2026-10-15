---
title: AI Tools
---

# AI Tools (`ai-tools.yaml`)

A data-driven workflow for adding and managing AI developer tools — MCP servers,
plugins, skills, agents, and package-manager CLIs — across any number of AI coding
agents (Claude Code, GitHub Copilot, OpenAI Codex, …), the same way
[`apps.yaml`](scripts.md) manages applications.

Two files drive it:

| File | Answers |
|------|---------|
| **`home/.chezmoidata/ai-tools.yaml`** | *What* to install: MCP servers, plugins, skills, packages |
| **`home/.chezmoidata/ai-agents.yaml`** | *How each agent* receives things: its CLI, how MCP servers reach it, where skills go |

Edit those files and run `chezmoi apply` — nothing else needs touching.

## How it works

`chezmoi apply` does everything, in two ways:

| Mechanism | Handles |
|-----------|---------|
| **chezmoi templates** | package tools and agent CLIs → mise config (`~/.config/mise/config.toml`); `vscode-json` agents' MCP servers → VS Code `mcp.json` (next to `settings.json`) |
| **`run_onchange_after_04-sync-ai-tools` script** (per-OS: PowerShell + bash) | imperative installs: MCP registration, plugin installs, published skill installs (`npx skills add`), custom skill/agent copy, package post-install steps |

The sync script inlines the tool list from `ai-tools.yaml` at render time (like
`run_onchange_02-install-apps`), so it re-runs automatically whenever the data
changes. Every external command it runs is **best-effort**: if a CLI (`claude`,
`codex`, …) isn't installed yet, it logs a follow-up note and moves on — a missing
tool never fails `chezmoi apply`.

## Agents (`ai-agents.yaml`)

One entry per agent. The sync script and templates never name an agent; they
loop over this registry, so **adding an agent is one new entry** — no script
edits for any agent whose needs fit the existing options below.

```yaml
aiAgents:
  codex:
    displayName: OpenAI Codex
    cli: codex                      # binary probed before CLI-based installs
    install:                        # optional: install the CLI itself via mise
      mise: { backend: npm, package: "@openai/codex" }
    mcp:
      method: codex-toml            # claude-cli | vscode-json | codex-toml | none
      file: .codex/config.toml      # (codex-toml) relative to $HOME
    plugins:
      supported: false              # has `<cli> plugin marketplace add` / `plugin install`?
    skills:
      cliAgent: codex               # `npx skills add --agent <this>` ("" = unsupported)
      dir: .codex/skills            # custom skills are copied here (relative to $HOME)
      agentsDir: ""                 # custom agents are copied here ("" = none)
      manifest: ""                  # optional skills manifest to update (relative to $HOME)
```

| `mcp.method` | What happens |
|--------------|--------------|
| `claude-cli` | `claude mcp add-json --scope user` (best-effort; skipped if the CLI is missing) |
| `vscode-json` | the server is written to the managed VS Code `mcp.json` (Copilot reads it from there) |
| `codex-toml` | the servers are rendered as `[mcp_servers.<name>]` tables inside a marker-delimited block (`# BEGIN/END chezmoi ai-tools mcp`) in `mcp.file`. Everything else in that file — Codex stores trust levels there — is left alone. `type` is dropped and `headers` becomes `http_headers`. |
| `none` | the agent receives no MCP servers from here |

Define an MCP server in a way the existing methods can't express (a different
config format, say) by adding one branch for the new `mcp.method` in each of the
two sync scripts and a rendering template if needed — everything else stays data.

### Adding an agent

1. Add its entry to `ai-agents.yaml`.
2. Run `chezmoi apply`. Every tool in `ai-tools.yaml` with no `agents:` list now
   targets it automatically, and its CLI is installed if `install:` is set.
3. Optional: a `plugin` entry gains support by declaring a subkey named after the
   agent (and the agent needs `plugins.supported: true`).

A misspelled agent name in an `agents:` list fails the render with the list of
valid names, rather than silently installing nowhere.

## The schema

`aiTools` is organized by category — the key under `aiTools` tells you what
a tool is; there is no separate `type:` field.

```yaml
aiTools:
  mcp:     { <name>: {...} }
  plugin:  { <name>: {...} }
  skill:   { <name>: {...} }
  package: { <name>: {...} }
  custom:  { <name>: {...} }
```

Every entry may set `forPersonal: false` to skip it on work machines.
`mcp`, `skill` and `custom` entries may set `agents: [claude, codex]` to
limit which agents (keys of `ai-agents.yaml`) receive them; **omit it to target
every agent**, including ones added later. `plugin` entries target an agent by
declaring a subkey named after it; `package` entries have no per-agent
behavior. Neither `plugin` nor `package` entries carry `agents`.

### `mcp` — MCP servers

Delivered to each targeted agent by that agent's `mcp.method` (see
[Agents](#agents-ai-agentsyaml)). A single `config:` dict, written in the
Claude/VS Code JSON shape, is the one source for all of them — any field those
schemas support just works, and the `codex-toml` method translates it for Codex.

```yaml
  mcp:
    playwright-mcp:
      config:
        type: stdio
        command: npx
        args: ["@playwright/mcp@latest"]

    context7:
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

No `agents` field — package installs aren't per-agent:

```yaml
  package:
    graphify:
      mise: { backend: pipx, package: graphifyy }
      postInstall: "graphify install"
```

### `plugin` — marketplace plugins

A plugin installs for whichever agents it declares a subkey for (and only
agents with `plugins.supported: true`):

```yaml
  plugin:
    superpowers:
      claude:  { marketplaceAdd: "anthropics/claude-plugins-official", install: "superpowers@claude-plugins-official" }
      copilot: { marketplaceAdd: "obra/superpowers-marketplace", install: "superpowers@superpowers-marketplace" }
```

### `skill` — published skills from a GitHub repo

Installed with the [skills CLI](https://github.com/vercel-labs/skills), the
package manager for agent skills:

```bash
npx --yes skills add <repo> [--skill <skill>] --agent <skills.cliAgent> -g -y
```

```yaml
  skill:
    brainstorming:
      # agents: [claude, codex]  # optional -- omit for every agent
      repo: obra/superpowers    # <owner>/<repo> on GitHub
      skill: brainstorming      # optional -- omit to install every skill in the repo
```

| Field | Required | Meaning |
|-------|----------|---------|
| `repo` | yes | `<owner>/<repo>` to install from |
| `skill` | no | a single skill inside that repo; omit to take them all |
| `agents` | no | limit to these agents; default is all. Each agent's `skills.cliAgent` is the `--agent` value (`claude-code`, `github-copilot`, `codex`, …) |

The sync script runs one `npx skills add` per targeted agent, always with `-g`
(user-level, so the skill applies to every project) and `-y` (no prompts, so
`chezmoi apply` never blocks). If `npx` is missing or an install fails, the
exact command is printed as a follow-up note instead of failing the apply.

Use this for skills someone else publishes; use `custom` below for skills you
write yourself.

### `custom` — your own skills and agents

```yaml
  custom:
    my-skill:
      kind: skill        # skill | agent
      # agents: [claude, codex]  # optional -- omit for every agent
```

Author the content once under the neutral source directory, then declare it:

```
home/dot_ai/skills/<name>/SKILL.md     ->  ~/.ai/skills/<name>/
home/dot_ai/agents/<name>/             ->  ~/.ai/agents/<name>/
```

The sync script **copies** it into each targeted agent's location (copy, not
symlink — so it works on Windows without Developer Mode). The destination comes
from the agent's `skills.dir` (skills) or `skills.agentsDir` (agents); an agent
with an empty `agentsDir` simply skips agents. Today:

| kind | Claude | Copilot | Codex |
|------|--------|---------|-------|
| skill | `~/.claude/skills/<name>` | `~/.agents/skills/<name>` (+ registered in its skills manifest if present) | `~/.codex/skills/<name>` |
| agent | `~/.claude/agents/<name>` | — (Copilot agents are extension-defined) | — |

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
codex mcp list           # Codex servers from the managed block
ls ~/.claude/skills ~/.agents/skills ~/.codex/skills  # installed + custom skills present
```

## Removing tools

Delete an entry from `ai-tools.yaml` and run `chezmoi apply`: the sync script
uninstalls what it previously installed and no longer finds in the data. It covers
Claude MCP servers, plugins, skills and custom skills/agents; `package` entries are
not removed (use `mise uninstall`).

How it works: each run records every tool it targets as a `type|agent-or-method|name|extra` line in
`~/.local/state/chezmoi-ai-tools.state`. Lines missing from the next run are
removed (`claude mcp remove`, `<cli> plugin uninstall`, `npx skills remove`, or deleting
the copied custom directory). A removal that fails stays in the file and is retried on
the next apply.

- Only tools this script installed are touched. Anything you added by hand is left alone.
- The first run after upgrading has no state file, so it removes nothing and just starts tracking.
- Narrowing an entry's `agents:` list also removes it from the dropped agents.
- Skills with no `skill:` field (whole-repo installs) are not tracked, because their names are unknown.
- Plugin marketplaces are not removed; run `<cli> plugin marketplace remove <name>` yourself.
- Codex and Copilot MCP servers need no tracking: their config is regenerated on every apply.

## Starter tools

| Tool | Type | Agents | Notes |
|------|------|-----------|-------|
| playwright-mcp | mcp | all | browser automation |
| context7 | mcp | all | docs lookup; optional API key |
| github | mcp | all | GitHub API; needs a PAT |
| superpowers | plugin | claude, copilot | skills/workflow bundle (Codex: no plugin support yet) |
| vercel-react-best-practices | skill | all | from `vercel-labs/agent-skills` |
| web-design-guidelines | skill | all | from `vercel-labs/agent-skills` |
| graphify | package (pipx) | — | `graphify install` post-step |
| openspec | package (npm) | — | per-repo `openspec init` |

## Troubleshooting

### `Invalid configuration: : Invalid input` when registering an MCP

Fixed — but worth knowing why, because it will bite any new PowerShell code that
passes JSON to a native command. Windows PowerShell reconstructs a command line
from the argument strings and does **not** escape embedded double quotes, so
`{"type":"stdio"}` reached `claude` as `{type:stdio}` (and any config with a
space in it — a `Bearer <token>` header — was split into several arguments).
`claude mcp add-json` then failed schema validation on the garbage it parsed.

The Windows sync script routes JSON through `ConvertTo-NativeArg`, which escapes
to the `CommandLineToArgvW` rules. PowerShell 7.3+ handles this natively via
`$PSNativeCommandArgumentPassing`, except in its default `Windows` mode when the
target is a `.cmd`/`.bat` shim — which is exactly how npm-installed CLIs land on
`PATH` — so the helper checks both before deciding to escape.

### An MCP is skipped for rendering `<no value>`

A `{{ ... }}` expression inside `config:` resolved to nothing — nearly always a
Doppler secret that doesn't exist under the name given, since `missingkey=zero`
turns a missing key into the literal text `<no value>`. Check what the config
actually renders to:

```bash
chezmoi execute-template '{{ includeTemplate "mcp-server-json" .aiTools.mcp.github.config }}'
```

Fix the secret name (or add the secret in Doppler) and re-run `chezmoi apply --force`.

The sync script refuses to register a server in this state. That guard matters
more than it looks on Windows: `<` and `>` are cmd.exe redirection operators, so
an unresolved value doesn't just store a broken server — it corrupts the command
line on the way to a `.cmd`-shimmed `claude`, which surfaces as the same
`Invalid configuration: : Invalid input` described above. The same hazard applies
to any secret containing `&`, `|`, `^`, `<` or `>`; if you hit that, configure the
server in `~/.claude.json` directly rather than through the CLI.

### `No matching skills found for: <name>`

The `skill:` key must be the published skill name **exactly**; the CLI does not
fuzzy-match. Run `npx --yes skills add <owner>/<repo>` with no `--skill` to list
what the repo actually offers, then copy the name verbatim. (Vercel's skills are
all `vercel-`-prefixed: `vercel-react-best-practices`, not `react-best-practices`.)

### `Failed to install plugin: Access is denied. (os error 5)`

A [known Copilot CLI bug on Windows](https://github.com/github/copilot-cli/issues/4095):
the installer swaps the installed-plugins folder, and Windows refuses to replace
a directory while VS Code's Copilot extension or a live `copilot` session holds
watcher handles on it. Close VS Code and any running `copilot` session, then:

```bash
chezmoi apply --force
```
