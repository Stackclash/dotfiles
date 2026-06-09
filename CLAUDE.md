# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

This is a chezmoi-managed dotfiles repository (minimum version 2.67.0). The chezmoi root is the `home/` directory (set via `.chezmoiroot`). All files and scripts within `home/` are managed by chezmoi and deployed to the user's home directory.

GitHub: https://github.com/Stackclash/dotfiles

## Common Commands

```powershell
# Apply all dotfiles (from anywhere on the machine)
chezmoi apply

# Preview changes without applying
chezmoi diff

# Edit a managed file and apply it
chezmoi edit ~/.gitconfig --apply

# Re-run all onchange scripts (useful after editing .chezmoidata)
chezmoi apply --force

# Serve documentation locally
cd docs && mkdocs serve

# Bootstrap a new machine (Windows)
powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr https://raw.githubusercontent.com/Stackclash/dotfiles/main/setup/bootstrap.ps1 | iex"

# Bootstrap a new machine (macOS/Linux)
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Stackclash/dotfiles/main/setup/bootstrap.sh)"
```

## Architecture

### Directory Structure

- `home/` — Chezmoi source root; maps 1:1 to `~` after applying
- `home/.chezmoidata/` — YAML data files consumed by all templates and scripts
- `home/.chezmoiscripts/` — Automation scripts split by OS (`Darwin/`, `Windows/`)
- `home/.chezmoitemplates/` — Reusable Go template fragments (included via `{{ template "name" . }}`)
- `setup/` — Bootstrap scripts for new machine provisioning
- `docs/` — MkDocs documentation site

### Data-Driven Configuration

All dynamic configuration lives in `home/.chezmoidata/`:

| File | Purpose |
|------|---------|
| `apps.yaml` | App definitions with per-OS install methods (winget/choco/brew) |
| `themes.yaml` | Color themes with RGB/hex values (dracular, molokai, mojave_dark) |
| `vscode-profiles.yaml` | VS Code profiles with per-profile extension lists |

Scripts and templates reference these as `.apps`, `.themes`, and `.vscodeProfiles`. Editing a data file and running `chezmoi apply` is enough to trigger relevant `run_onchange_*` scripts.

### Script Naming Convention

Scripts in `.chezmoiscripts/` follow: `{run_type}_{sequence}-{name}.{ext}[.tmpl]`

- `run_once_before_*` — Runs once before files are applied (e.g., install package manager)
- `run_onchange_*` — Runs whenever the script content changes (e.g., install/update apps)
- `run_once_after_*` — Runs once after files are applied (e.g., clone repos, OS setup)

The numeric prefix (`01`, `02`, ...) controls execution order within each type.

### Template Variables

Key variables available in all `.tmpl` files (defined via prompts in `home/.chezmoi.json.tmpl`):

| Variable | Description |
|----------|-------------|
| `.name` | User's full name |
| `.email` | Personal email |
| `.workComputer` | Boolean — is this a work machine? |
| `.workEmail` / `.workGithubOrg` | Work identity (only when `workComputer` is true) |
| `.githubUsername` | GitHub username |
| `.projectPath` | Local projects directory |
| `.theme` | Selected theme name (`dracular` or `molokai`) |
| `.chezmoi.os` | `windows`, `darwin`, or `linux` |

Use `{{- if eq .chezmoi.os "windows" }}` for OS-conditional blocks.

### Reusable Templates

Templates in `home/.chezmoitemplates/` are included with `{{ template "name" . }}`:

- **`elevate-powershell`** — Re-launches the script as Administrator if not already elevated
- **`theme-helpers`** — Defines `rgbToHex` and `rgbToFloat` functions for color conversion
- **`vscode-settings`** — Generates the VS Code `settings.json` content
- **`vscode-keybindings`** — Generates VS Code `keybindings.json` content

### Cross-Platform Handling

- OS-specific scripts live under `.chezmoiscripts/Darwin/` and `.chezmoiscripts/Windows/`
- `.chezmoiignore.tmpl` excludes platform-irrelevant files (e.g., `AppData/**` on macOS, `Library/**` on Windows)
- Apps in `apps.yaml` have separate `windows:` and `darwin:` blocks; apps with `forPersonal: true` are skipped on work machines

### Adding a New App

1. Add an entry to `home/.chezmoidata/apps.yaml` with `windows:` and/or `darwin:` install info
2. Run `chezmoi apply` — the `run_onchange_02-install-apps` script will re-run and install it

### Adding a New VS Code Profile

1. Add the profile and its extensions to `home/.chezmoidata/vscode-profiles.yaml`
2. Run `chezmoi apply` — the `run_onchange_03-setup-vscode-profiles` script syncs extensions
