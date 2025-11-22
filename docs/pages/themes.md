---
title: Themes
---

# Theme System

This dotfiles setup includes a **data-driven theme system** built from:

- `themes.yaml` — defines theme colors
- `theme-colors` template — provides helper functions for color manipulation

---

## themes.yaml

Example:

```yaml
active: "gruvbox"

themes:
  gruvbox:
    primary: "#fabd2f"
    background: "#1d2021"
    text: "#ebdbb2"

  nord:
    primary: "#88C0D0"
    background: "#2E3440"
    text: "#ECEFF4"
```

You can add:
- accents
- borders
- opacity variants
- RGB arrays
- semantic color names

## theme-colors Template
Provides functions such as:
- hexToRGB
- rgbToHex
- shade/darken/lighten
- color extraction utilities
- reusable color structures for JSON/YAML templates

Example usage in a VS Code settings template:

```gotmpl
"activityBar.background": "{{ themeColor "background" }}",
"activityBar.foreground": "{{ themeColor "text" }}",
"button.background": "{{ themeColor "primary" }}",
```

## Using Themes in Other Templates
You access the active theme via:

```gotmpl
{{ $theme := index .data.themes.themes .data.themes.active }}
```

Then access colors:

```gotmpl
{{ $theme.primary }}
```

Or use helper functions:

```gotmpl
{{ colorHex "primary" }}
{{ hexToRGB $theme.primary }}
```

## Where Themes Are Used
- VS Code
- Windows Terminal
- Oh My Posh
- Clink
- Shell prompts
- JSON/YAML-based config files
- Any file that supports colors