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
this to skip themselves unless `workComputer` or `setupWork` is true.

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
- `run_02-install-apps.ps1.tmpl`: installs and upgrades `apps.yaml` `windows:` entries
- `run_03-setup-vscode-profiles.ps1.tmpl`: VS Code profile extension sync
- `run_onchange_after_03-mise-install.ps1.tmpl`: `mise install`
- `run_after_04-sync-ai-tools.ps1.tmpl`: see [AI Tools](ai-tools.md)
- `run_once_after_04-clone-{personal,work}-repos.ps1.tmpl`
- `run_once_after_06-windows-setup.ps1.tmpl`: debloat and OS settings

### `Darwin/`
- `run_once_before_01-install-brew.sh`: installs Homebrew
- `run_02-install-apps.sh.tmpl`: `brew update` + `brew upgrade`, then `brew bundle` from `apps.yaml` `darwin:` entries

### `Linux/`
- `run_02-install-apps.sh.tmpl`: upgrades the system (`omarchy update -y` on Omarchy; `pacman -Syu` + AUR, `apt-get upgrade` or `dnf upgrade` elsewhere), then installs `apps.yaml` `linux:` entries with this distro's package managers (see [Configuration](configuration.md#linux-package-managersyaml)). Pending upgrades and missing packages are checked without root, so sudo is only asked for when there is something to do.
- `run_onchange_after_05-omarchy-theme.sh.tmpl`: Omarchy only, applies `omarchyPrefs.theme` (see [Omarchy](omarchy.md))

### `posix/` (macOS + Linux)
- `run_03-setup-vscode-profiles.sh.tmpl`: VS Code profile extension sync. It reads JSON with `jq`, falling back to `plutil`.
- `run_onchange_after_03-mise-install.sh.tmpl`: `mise install`
- `run_after_04-sync-ai-tools.sh.tmpl`: see [AI Tools](ai-tools.md)
- `run_once_after_04-clone-{personal,work}-repos.sh.tmpl`

## Same setup on every OS

Each OS runs the same steps: install and upgrade apps (02), sync VS Code
profiles (03), `mise install` (03), sync AI tools (04), and clone repos (04).
The clone scripts log `gh` in over https and clone into `projectPath`.
Only these are OS-specific, because the OS needs them:

- Package manager bootstrap: Chocolatey/WinGet on Windows, Homebrew on macOS (Linux uses the distro's own).
- `Windows/run_once_after_06-windows-setup`: debloat and OS settings.
- `Linux/run_onchange_after_05-omarchy-theme`: Omarchy only.

On Windows, only the package-manager, install-apps and Windows-setup scripts
elevate. Everything that writes to your
profile (VS Code extensions, mise tools, AI tools, cloned repos) runs as you,
because files an elevated process creates are owned by Administrators.

> [!WARNING]
> The VS Code sync has `REMOVE_EXTRA=true`, so it uninstalls extensions that
> aren't declared in `vscode-profiles.yaml`.

## Adding a script

Put it in the folder for the OSes it should run on. Use `posix/` for bash that
works on both macOS and Linux. Scripts that need mise tools should include
`{{ template "mise-path" . }}`, because chezmoi's environment has no rc file loaded.
