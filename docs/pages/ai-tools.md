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

Every entry has an `assistant` (`claude`, `copilot`, or `both`) and a `type` that
decides how it's installed.

```yaml
aiTools:
  <name>:
    assistant: claude | copilot | both
    type: mcp | package | plugin | custom
    forPersonal: false        # optional — skipped on work machines
    projectOnly: true         # optional — documented only, never auto-installed
    projectNote: "..."        # optional — shown in docs and task output
```

### `type: mcp` — MCP servers

Registered with **Claude** (user scope, via `claude mcp add-json`) and, for
`copilot`/`both`, written into the managed VS Code **`mcp.json`** (a dedicated file
next to `settings.json`, with a top-level `servers` object — VS Code no longer accepts
MCP config inside `settings.json`). Both consumers are fed the **same JSON**, produced
by the shared `mcp-server-json` template, so a server behaves identically for Claude and
VS Code.

There are two ways to declare the server. Use whichever fits.

#### Full `config:` block (recommended)

The `config:` block is emitted **verbatim as the server's JSON**, so you can use any
field the assistant supports — not just a fixed `transport`/`url`/`apiKey*` shape. This
is the way to reach the full MCP config surface (custom headers, multiple env vars,
alternate transports, and any future fields).

```yaml
  context7:
    assistant: both
    type: mcp
    mcp:
      config:
        type: http                       # http | sse | stdio
        url: "https://mcp.context7.com/mcp"
        headers:
          CONTEXT7_API_KEY: "{{ .context7ApiKey }}"
```

**Injecting secrets — `{{ .someKey }}` templating.** Anywhere inside a `config:` block
you can reference a value from your chezmoi config (`~/.config/chezmoi/chezmoi.json` —
including everything collected at `chezmoi init`) with `{{ .someKey }}`. Each reference
is replaced at apply time with the JSON-escaped value, so a secret can go into **any**
field, standalone or embedded mid-string:

```yaml
      config:
        type: stdio
        command: some-mcp-server
        args: ["--flag"]
        env:
          API_TOKEN: "{{ .someSecret }}"
          AUTH: "Bearer {{ .someSecret }}"   # embedded is fine
```

A reference to a key that isn't in your chezmoi config is left untouched (so a stray
placeholder is visible rather than silently blanked). Only top-level config keys are
substituted.

#### Legacy shorthand

The original constrained fields still work and are handy for simple servers:

```yaml
  playwright-mcp:
    assistant: both
    type: mcp
    mcp:
      transport: stdio            # stdio | http | sse
      command: npx
      args: ["@playwright/mcp@latest"]

  context7:
    assistant: both
    type: mcp
    mcp:
      transport: http
      url: "https://mcp.context7.com/mcp"
      apiKeyHeader: CONTEXT7_API_KEY   # header injected with the key below
      apiKeyFrom: context7ApiKey       # name of the chezmoi data value to use
```

With the shorthand, a blank `apiKeyFrom` value drops the header entirely (keyless mode).

### `type: package` — package-manager CLIs

The `mise` block is rendered into `~/.config/mise/config.toml` `[tools]`, so mise
installs and keeps it updated. An optional `postInstall` runs afterward.

```yaml
  graphify:
    assistant: claude
    type: package
    mise: { backend: pipx, package: graphifyy }   # backend: npm | pipx
    postInstall: "graphify install"
```

### `type: plugin` — marketplace plugins

```yaml
  superpowers:
    assistant: both
    type: plugin
    plugin:
      claude:
        marketplaceAdd: "anthropics/claude-plugins-official"
        install: "superpowers@claude-plugins-official"
      copilot:
        marketplaceAdd: "obra/superpowers-marketplace"
        install: "superpowers@superpowers-marketplace"
```

If the CLI can't install it non-interactively, the task prints the manual
`/plugin install …` command to run in an interactive session.

### `type: custom` — your own skills and agents

Author the content once under the neutral source directory, then declare it:

```
home/dot_ai/skills/<name>/SKILL.md     ->  ~/.ai/skills/<name>/
home/dot_ai/agents/<name>/             ->  ~/.ai/agents/<name>/
```

```yaml
  my-skill:
    assistant: both
    type: custom
    custom: { kind: skill }     # kind: skill | agent
```

The sync script **copies** it into each assistant's location (copy, not symlink — so
it works on Windows without Developer Mode):

| kind | Claude | Copilot |
|------|--------|---------|
| skill | `~/.claude/skills/<name>` | `~/.agents/skills/<name>` (+ registered in the Copilot skills manifest if present) |
| agent | `~/.claude/agents/<name>` | — (Copilot agents are extension-defined) |

## Project-only tools (opt-in, per-project)

Some tools **must** be installed inside a project and are intentionally **not**
automated. They're marked `projectOnly: true` and only surface as documentation.

| Tool | How to enable it in a repo |
|------|----------------------------|
| **OpenSpec** | CLI is global (mise); run `openspec init` in the repo |
| **nestjs-doctor** | `npm i -D nestjs-doctor && npx nestjs-doctor --init` |
| **superspec** | `mise run superspec-init` (needs OpenSpec + Superpowers) — see below |

### `mise run superspec-init`

A helper that sets up the [superspec](https://github.com/danielhanold/superspec)
OpenSpec schema in the **current** repo: it sparse-checks-out the schema into
`openspec/schemas/superspec/` and writes `openspec/config.yaml`. Run it from a repo
root that already has OpenSpec initialized (`openspec init --profile custom`).

## Secrets and the Context7 API key

`chezmoi init` prompts for a **Context7 API key** (leave blank to run keyless with
rate limits) and stores it in your chezmoi config as `context7ApiKey`. It reaches the
MCP config the same way any secret does — the `apiKeyFrom` shorthand, or a
`{{ .context7ApiKey }}` reference in a `config:` block. To add more secrets, prompt for
them in `home/.chezmoi.json.tmpl` (so they land in your chezmoi config) and reference
them with `{{ .yourKey }}` wherever you need them.

> [!WARNING]
> Any value injected this way is stored in plaintext in
> `~/.config/chezmoi/chezmoi.json` and the VS Code `mcp.json`, and is embedded in the
> rendered sync script at apply time. If you'd rather keep a secret out of dotfiles,
> leave its prompt blank and source it at runtime instead — e.g. a `${env:VAR}`
> reference in the MCP `config:` for tools that expand it, or an external secret
> manager (Doppler, 1Password, …).

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
| nestjs-doctor | projectOnly | both | per-project dev dependency |
| superspec | projectOnly | both | `mise run superspec-init` |
