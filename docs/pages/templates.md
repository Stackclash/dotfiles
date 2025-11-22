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
├── elevate-powershell
├── theme-colors
├── vscode-keybindings
└── vscode-settings
```
yaml
Copy code

Each file defines reusable template fragments or functions.

---

## Key Templates

### `theme-colors`
Provides helper functions for working with theme colors defined in:

home/.chezmoidata/themes.yaml

yaml
Copy code

Includes helpers such as:

- `hexToRGB`
- `rgbToHex`
- Shade/opacity helpers (optional depending on your implementation)

---

### `vscode-settings` and `vscode-keybindings`
These templates unify:

- Shared base settings  
- Per-profile settings  
- OS-specific overrides  

Used to generate:

~/AppData/Roaming/Code/User/settings.json
~/AppData/Roaming/Code/User/keybindings.json

yaml
Copy code

And their macOS equivalents.

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