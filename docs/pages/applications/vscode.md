---
title: Visual Studio Code
---

# Visual Studio Code Integration

VS Code setup in this dotfiles repo is **fully automated and templated**, including:

- settings  
- keybindings  
- extensions  
- profiles  
- OS-specific variations  

---

## File Structure
```
home/
└── AppData/Roaming/Code/User/
├── settings.json.tmpl
└── keybindings.json.tmpl

home/.chezmoitemplates/
├── vscode-settings
└── vscode-keybindings

home/.chezmoidata/
└── vscode-profiles.yaml
```

---

## How Settings Are Generated

1. A **shared base settings** file is defined inside:
```
.chezmoitemplates/vscode-settings
```
2. Additional configurations can be layered via:
- per-profile settings  
- OS-specific checks  
- theme colors  

Example template:

```json
{
    "editor.fontFamily": "JetBrains Mono",
    "workbench.colorCustomizations": {
        "activityBar.background": "{{ themeColor "primary" }}"
    }
}
```

## Extensions Installation
Extensions are declared in:

```
home/vscode-extensions.txt
```
Installed via:
- macOS: run_onchange_03-install-vscode-extensions.sh.tmpl
- Windows: run_onchange_03-install-vscode-extensions.ps1.tmpl

## Profiles
Once `vscode-profiles.yaml` is added, you’ll be able to:
- generate per-profile folders
- merge base + profile settings
- auto-install profile-specific extensions