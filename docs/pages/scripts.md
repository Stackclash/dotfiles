---
title: Scripts
---

# Automation Scripts (`.chezmoiscripts`)

Scripts are grouped by the OSes they run on. `.chezmoiignore.tmpl` hides every
folder that doesn't apply to the current machine:

```
home/.chezmoiscripts/
├── Windows/   # windows only (PowerShell)
├── Darwin/    # macOS only (Homebrew)
├── Linux/     # Linux only (distro package managers, Omarchy)
└── posix/     # macOS + Linux (shared bash scripts)
```

Naming follows `{run_type}_{sequence}-{name}.{ext}[.tmpl]`. chezmoi runs the
scripts in name order, so the numeric prefix controls ordering. A script that
renders to nothing but whitespace is skipped. The work-only clone scripts use
this to skip themselves unless `workComputer` is true.

## Script types

| Prefix | Runs |
|--------|------|
| `run_` | every `chezmoi apply` |
| `run_once_` | once per unique script content |
| `run_onchange_` | whenever the rendered content changes (scripts embed a hash of the data they read) |
| `…_before_` / `…_after_` | before / after files are written |

## Scripts by folder

### `Windows/`
- `run_once_before_01-install-package-manager.ps1.tmpl`: winget/choco bootstrap
- `run_02-install-apps.ps1.tmpl`: installs `apps.yaml` `windows:` entries
- `run_03-setup-vscode-profiles.ps1.tmpl`: VS Code profile extension sync
- `run_onchange_after_03-mise-install.ps1.tmpl`: `mise install`
- `run_after_04-sync-ai-tools.ps1.tmpl`: see [AI Tools](ai-tools.md)
- `run_once_after_04-clone-{personal,work}-repos.ps1.tmpl`
- `run_once_after_06-windows-setup.ps1.tmpl`: debloat and OS settings

### `Darwin/`
- `run_once_before_01-install-brew.sh`: installs Homebrew
- `run_02-install-apps.sh.tmpl`: `brew bundle` from `apps.yaml` `darwin:` entries

### `Linux/`
- `run_onchange_02-install-apps.sh.tmpl`: installs `apps.yaml` `linux:` entries with this distro's package managers (see [Configuration](configuration.md#linux-package-managersyaml))
- `run_onchange_after_05-omarchy-theme.sh.tmpl`: Omarchy only, applies `omarchyPrefs.theme` (see [Omarchy](omarchy.md))

### `posix/` (macOS + Linux)
- `run_03-setup-vscode-profiles.sh.tmpl`: VS Code profile extension sync. It reads JSON with `jq`, falling back to `plutil`.
- `run_onchange_after_03-mise-install.sh.tmpl`: `mise install`
- `run_after_04-sync-ai-tools.sh.tmpl`: see [AI Tools](ai-tools.md)
- `run_once_after_04-clone-{personal,work}-repos.sh.tmpl`

> [!WARNING]
> The VS Code sync has `REMOVE_EXTRA=true`, so it uninstalls extensions that
> aren't declared in `vscode-profiles.yaml`.

## Adding a script

Put it in the folder for the OSes it should run on. Use `posix/` for bash that
works on both macOS and Linux. Scripts that need mise tools should include
`{{ template "mise-path" . }}`, because chezmoi's environment has no rc file loaded.
