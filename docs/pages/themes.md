---
title: Themes
---

# Theme System

There are two theme systems, one per platform family:

- **Windows / macOS (VS Code)**: `home/.chezmoidata/themes.yaml` plus the
  `theme-helpers` template, selected by the `.theme` prompt.
- **Omarchy**: Omarchy's own themes (`omarchy theme list`), selected by
  `omarchyPrefs.theme` in `home/.chezmoidata/omarchy.yaml`. See [Omarchy](omarchy.md).
  Omarchy already re-themes VS Code, terminals and the bar when the theme changes.

The Starship prompt (`~/.config/starship.toml`) only uses ANSI colors, so it
follows whichever terminal theme is active on every OS.

## themes.yaml

Each theme (`dracular`, `molokai`, `mojave_dark`) defines `background` and
`foreground` as `[R, G, B]` arrays, plus the 16 terminal colors as hex strings
without `#` (`d_*` normal, `l_*` light/bright):

```yaml
themes:
  dracular:
    background: [40, 42, 54]
    foreground: [248, 248, 242]
    d_red: [255, 85, 85]
    d_blue: BD93F9
    l_blue: CAA9FA
    # ...
```

## theme-helpers template

Defines two named templates for the RGB arrays:

- `rgbToHex`: `[R,G,B]` to `#RRGGBB`
- `rgbToFloat`: `[R,G,B]` to `[r, g, b]` floats from 0 to 1 (iTerm2 format)

## Using a theme in a template

```gotmpl
{{- template "theme-helpers" -}}
{{- $themeColors := index .themes .theme -}}
"editor.background": "{{ template "rgbToHex" $themeColors.background }}",
"terminal.ansiBlue": "#{{ $themeColors.d_blue }}",
```

> [!NOTE]
> **Current state:** no template uses these colors yet. `vscode-settings` looks up
> `$themeColors` but never reads it, and nothing calls `theme-helpers`. The `.theme`
> prompt (`promptChoice` in `.chezmoi.json.tmpl`, offering `dracular` / `molokai`)
> is asked on every `chezmoi init`. Either wire the colors into VS Code / Windows
> Terminal or remove `themes.yaml`, `theme-helpers` and the prompt.
