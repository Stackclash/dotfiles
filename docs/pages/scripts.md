---
title: Scripts
---

# Automation Scripts (`.chezmoiscripts`)

Chezmoi supports **run_once**, **run_onchange**, and **run_before** scripts that automate system setup.  
This repository organizes these scripts by platform:
```
home/.chezmoiscripts/
├── Darwin/
└── Windows/
```
---

## Script Types

### `run_once_*.sh` / `.ps1`
Runs **only once**, after `chezmoi init --apply`.  
Used for tasks that should never repeat, such as:

- Installing Homebrew or Windows package manager
- Initial machine bootstrap
- Cloning personal/work repos

### `run_onchange_*.sh` / `.ps1`
Runs **whenever the script file changes**.  
Useful for:

- App installation lists
- VS Code extension installation
- Machine-specific system updates

### `run_before_*.sh`
Runs **before files are applied**.  
Ideal for:

- Bootstrapping package managers
- Installing dependencies required for generating certain templates

---

## macOS Scripts

Examples:

- **`run_once_before_01-install-brew.sh`**  
  Installs Homebrew if missing.

- **`run_onchange_02-install-mac-apps.sh.tmpl`**  
  Installs apps defined in `.chezmoidata/apps.yaml`.

- **Repo cloning scripts**  
  `run_once_after_04_clone-personal-repos.sh.tmpl`

---

## Windows Scripts

Examples:

- **`run_once_before_01-install-package-manager.ps1.tmpl`**  
  Bootstraps Winget / package manager.

- **`run_onchange_02-install-apps.ps1.tmpl`**  
  Installs apps declared in `.chezmoidata/apps.yaml`.

- **Terminal and shell setup**  
  `run_once_after_04-setup-terminal.ps1.tmpl`

---

## Adding Your Own Scripts

Just place your script under:

home/.chezmoiscripts/<OS>/<type>_*.sh

Chezmoi will automatically detect and execute it during the apply phase