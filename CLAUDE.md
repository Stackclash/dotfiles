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
- `home/.chezmoiscripts/` — Automation scripts split by OS (`Windows/`, `Darwin/`, `Linux/`, plus `posix/` shared by macOS and Linux)
- `home/.chezmoitemplates/` — Reusable Go template fragments (included via `{{ template "name" . }}`)
- `setup/` — Bootstrap scripts for new machine provisioning
- `docs/` — MkDocs documentation site

### Data-Driven Configuration

All dynamic configuration lives in `home/.chezmoidata/`:

| File | Purpose |
|------|---------|
| `apps.yaml` | App definitions with per-OS install methods (winget/choco/brew; `linux:` maps package manager → package name) |
| `linux-package-managers.yaml` | Package managers to try per distro (keyed by os-release ID, matched on `id` then `idLike`) |
| `omarchy.yaml` | Omarchy preferences (`omarchyPrefs`): theme and bar settings merged into `shell.json` |
| `ai-tools.yaml` | AI tools to install (MCP servers, plugins, skills, packages); `agents:` limits which agents get one |
| `ai-agents.yaml` | AI agent registry: per-agent CLI, MCP delivery method, skills/agents directories |
| `themes.yaml` | Color themes with RGB/hex values (dracular, molokai, mojave_dark) |
| `vscode-profiles.yaml` | VS Code profiles with per-profile extension lists |

Scripts and templates reference these as `.apps`, `.linuxPackageManagers`, `.omarchyPrefs`, `.aiTools`, `.aiAgents`, `.themes`, and `.vscodeProfiles`. Editing a data file and running `chezmoi apply` is enough to trigger relevant `run_onchange_*` scripts.

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

Use `{{- if eq .chezmoi.os "windows" }}` for OS-conditional blocks, and `{{ if includeTemplate "is-omarchy" . }}` for Omarchy-only content. Detect the OS only through chezmoi's built-in data (`.chezmoi.os`, `.chezmoi.osRelease.id` / `.idLike`). `.chezmoi.osRelease` exists only on Linux, so check `.chezmoi.os` first.

### Reusable Templates

Templates in `home/.chezmoitemplates/` are included with `{{ template "name" . }}`:

- **`elevate-powershell`** — Re-launches the script as Administrator if not already elevated
- **`is-omarchy`** — Prints `true` on Omarchy, nothing elsewhere
- **`mise-path`** — Puts mise tools on PATH inside scripts (no rc file is loaded there)
- **`theme-helpers`** — Defines `rgbToHex` and `rgbToFloat` functions for color conversion
- **`vscode-settings`** — Generates the VS Code `settings.json` content
- **`vscode-keybindings`** — Generates VS Code `keybindings.json` content

### Cross-Platform Handling

- OS-specific scripts live under `.chezmoiscripts/{Windows,Darwin,Linux}/`. Bash shared by macOS and Linux goes in `posix/`.
- `.chezmoiignore.tmpl` excludes platform-irrelevant files (`AppData/**` and `Documents/**` off Windows, `Library/**` off macOS, `.config/hypr|omarchy/**` off Omarchy)
- Apps in `apps.yaml` have separate `windows:`, `darwin:` and `linux:` blocks. Apps with `forPersonal: true` are skipped on work machines.

### Omarchy

Omarchy (`$OMARCHY_PATH=/usr/share/omarchy`) owns its defaults. Never edit or manage anything under `/usr/share/omarchy`. See `docs/pages/omarchy.md`.
- `~/.bashrc` must keep Omarchy's `env-bootstrap` and `$OMARCHY_PATH/default/bash/rc` source lines. Omarchy's rc already sets up mise and starship.
- `~/.profile` and zsh files are not deployed on Omarchy, because `env-bootstrap` orders the login PATH itself.
- Files that Omarchy migrations rewrite (such as `~/.config/omarchy/shell.json`) get `modify_` merge scripts, never whole-file ownership.
- Use `omarchy-pkg-add` / `omarchy-pkg-aur-add` for packages. Omarchy-provided apps are `omarchy: shipped` in `apps.yaml`, with pacman/apt/dnf names so other Linux machines get them too.
- Review changes with `chezmoi diff --use-builtin-diff`. The configured diff tool is `code --wait`.

### Adding a New App

1. Add an entry to `home/.chezmoidata/apps.yaml` with `windows:`, `darwin:` and/or `linux:` install info (`linux:` keys are package managers: `omarchy`, `pacman`, `aur`, `apt`, `dnf`)
2. Run `chezmoi apply` — the `run_onchange_02-install-apps` script will re-run and install it

### Adding a New VS Code Profile

1. Add the profile and its extensions to `home/.chezmoidata/vscode-profiles.yaml`
2. Run `chezmoi apply` — the `run_onchange_03-setup-vscode-profiles` script syncs extensions
