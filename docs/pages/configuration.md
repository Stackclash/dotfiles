---
title: Configuration Data
---

# Configuration Data (`.chezmoidata` + `.chezmoi.json.tmpl`)

This repository uses **data-driven configuration**, meaning the contents of `.chezmoidata/` define how templates are generated.

---

## Directory Structure
```
home/.chezmoidata/
├── apps.yaml
├── themes.yaml
└── vscode-profiles.yaml
```

---

## apps.yaml — Application Lists

Defines which apps to install for each OS.

Example:

```yaml
windows:
  packages:
    - Microsoft.PowerShell
    - Git.Git

darwin:
  brews:
    - git
    - fish
```
Used by run_onchange_02-install-apps scripts for each platform.

## themes.yaml — Theme Definition
Defines reusable theme variables, e.g.:

```yaml
theme: "dark"

colors:
  primary: "#3B82F6"
  background: "#0F0F0F"
  text: "#E5E5E5"
```

Used in:
- VS Code templates
- Terminal themes
- Oh My Posh config
- Any file requiring color definitions

See the Themes page for details.

## vscode-profiles.yaml
Suggested structure:

```yaml
profiles:
  - name: "Personal"
    settings_file: "personal-settings.json"
    extensions:
      - ms-python.python
      - esbenp.prettier-vscode
```

This will allow your VS Code generator to:
- create per-profile config directories
- merge base settings + per-profile settings
- install profile-specific extensions

## .chezmoi.json.tmpl — Machine Variables
This file sets derived configuration values that other templates rely on.

Example:

```json
{
  "os": "{{ .chezmoi.os }}",
  "username": "{{ .chezmoi.username }}",
  "homedir": "{{ .chezmoi.homeDir }}"
}
```

You can also add machine-specific flags, such as:
```json
"workMachine": {{ eq .hostname "WORK-LAPTOP" }},
"gpu": "{{ .cpu.gpu | default "none" }}"
```

## Using Data in Templates
Data inside .chezmoidata/ is available via:

```gotmpl
{{ .data.apps }}
{{ .data.themes }}
```

The JSON from .chezmoi.json.tmpl becomes part of:
```gotmpl
{{ . }}
```

during template execution.