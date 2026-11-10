---
title: Templates
---

# Templates (`.chezmoitemplates`)

Chezmoi templates allow dynamic generation of files using:

- Go template syntax  
- Functions provided by chezmoi  
- Custom helper functions defined in template files  
- Data from `.chezmoidata/*`

---

## Template Directory Structure
```
home/.chezmoitemplates/
├── ai-targets              # AI tools: does this entry target this agent?
├── elevate-powershell      # re-launch a PowerShell script as Administrator
├── is-omarchy              # "true" on Omarchy, empty elsewhere
├── mcp-server-json         # AI tools: MCP config as JSON
├── mcp-server-toml         # AI tools: MCP config as a Codex TOML table
├── mcp-server-toml-value
├── mise-path               # put mise tools on PATH inside chezmoi scripts
├── theme-helpers           # rgbToHex / rgbToFloat
├── vscode-keybindings
├── vscode-mcp
└── vscode-settings
```

Each file defines a reusable template fragment or function.

---

## Key Templates

### `is-omarchy`
Prints `true` on Omarchy and nothing elsewhere. It is built on chezmoi's own data
(`.chezmoi.os`, then `.chezmoi.osRelease.id`), so it is safe on Windows/macOS, where
`.chezmoi.osRelease` doesn't exist.

```gotmpl
{{ if includeTemplate "is-omarchy" . }}...{{ end }}
```

### `mise-path`
Scripts run without any shell rc file, so they can't see mise tools by default.
This puts the mise shims on PATH (on macOS it loads Homebrew first, on Windows it
re-reads PATH from the registry). Include it at the top of any script that calls
a mise-managed tool:

```gotmpl
{{ template "mise-path" . }}
```

### `theme-helpers`
Defines `rgbToHex` and `rgbToFloat` for the colors in `.chezmoidata/themes.yaml`.

---

### `vscode-settings` and `vscode-keybindings`
These templates unify:

- Shared base settings  
- Per-profile settings  
- OS-specific overrides  

Used to generate:

- `~/AppData/Roaming/Code/User/{settings,keybindings}.json` (Windows)
- `~/Library/Application Support/Code/User/{settings,keybindings}.json` (macOS)

---

### `vscode-mcp`
Generates the VS Code user **`mcp.json`** (next to `settings.json`) from
`.chezmoidata/ai-tools.yaml` — the MCP servers targeting any agent whose
`ai-agents.yaml` `mcp.method` is `vscode-json` (Copilot today). VS Code requires MCP
config in this dedicated file, not inside `settings.json`.

---

### `mcp-server-json` / `mcp-server-toml` / `ai-targets`
Helpers for the AI tools sync. `mcp-server-json` renders an MCP `config:` as JSON
(resolving `{{ ... }}` secrets); `mcp-server-toml` renders the same config as a Codex
`[mcp_servers.<name>]` table; `ai-targets` answers "does this `ai-tools.yaml` entry
target this agent?" and rejects agent names `ai-agents.yaml` doesn't define.

---

### `elevate-powershell`
Contains logic for running elevated (Administrator) PowerShell tasks during script execution.

---

## Using Templates

Any file ending in `.tmpl` under `home/` is treated as a template.

You can call templates using:

```gotmpl
{{ template "vscode-settings" . }}
```

## Creating New Templates
Templates are ideal for:
- OS-specific file content
- Reused settings (e.g., proxies, secrets prompts)
- Shared JSON/YAML structures
- Re-usable helper functions (math, strings, color transforms)