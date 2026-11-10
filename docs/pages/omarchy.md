---
title: Omarchy
---

# Omarchy

[Omarchy](https://github.com/omacom/omarchy) is an Arch + Hyprland setup that ships its own
defaults under `/usr/share/omarchy` (`$OMARCHY_PATH`) and copies user-editable
files into `~/.config`. These dotfiles sit on top of Omarchy without fighting it:
Omarchy keeps its defaults, and chezmoi only adds your changes.

## What Omarchy owns vs. what chezmoi manages

| Area | Omarchy provides | chezmoi does |
|------|------------------|--------------|
| `~/.bashrc` | `env-bootstrap` + `$OMARCHY_PATH/default/bash/rc` (aliases, mise, starship, zoxide, fzf) | Keeps both source lines and adds only gh/kubectl completions |
| `~/.profile`, zsh | Login PATH via `env-bootstrap` (mise command-wrappers first, shims last) | Not deployed on Omarchy |
| Prompt | Starship + `~/.config/starship.toml` | Owns `starship.toml`, the same file on every OS (ANSI colors follow the theme) |
| Git | `~/.config/git/config` defaults | Moves those defaults into `~/.gitconfig` and removes the XDG copy (its gh helper path is pinned to a mise version) |
| Packages | Base system (`install/omarchy-base.packages`) | Installs `apps.yaml` `linux:` extras. Shipped tools are `omarchy: shipped` |
| Theme | `omarchy theme set` | Applies `omarchyPrefs.theme` when it changes |
| Bar (`omarchy/shell.json`) | Layout. Omarchy migrations rewrite it | Merges in `omarchyPrefs.bar` only (see below) |
| `hypr/*.lua` overrides | Stock copies Omarchy never rewrites | Not managed until you customize one (`chezmoi add ~/.config/hypr/<file>`) |
| Hooks (`omarchy/hooks/*.d`) | Hooks installed by Omarchy and plugins | Not managed. Add your own with `chezmoi add` |

Never edit or manage anything under `/usr/share/omarchy`.

## Preferences (`.chezmoidata/omarchy.yaml`)

```yaml
omarchyPrefs:
  theme: Hackerman            # display name from `omarchy theme list`
  bar:
    elsewhenCities:           # world-clock cities, wherever the widget sits
      - { name: Chicago, zone: America/Chicago }
    tray:                     # plugin widgets, added only if the plugin is installed
      - superwhisper.panel
```

- **Theme**: `Linux/run_onchange_after_05-omarchy-theme.sh` runs `omarchy theme set`
  only when this value changes. A theme picked in the switcher stays until you
  edit the file.
- **Bar**: `dot_config/omarchy/modify_shell.json.tmpl` is a chezmoi *modify*
  script. It reads the current `shell.json`, sets the Elsewhen cities and appends
  missing tray plugins with `jq`, and leaves everything else as Omarchy wrote it.
  With no file, it starts from Omarchy's default.

## `omarchy-refresh-config`

`omarchy-refresh-config <path>` copies an Omarchy default over `~/.config/<path>`
(it backs up the old file first). If that path is managed here, `chezmoi diff`
shows the difference and `chezmoi apply` restores your version.

## Setting up a new Omarchy machine

1. Run the bootstrap one-liner from the README. On Linux it installs the Doppler
   CLI with mise and runs `doppler login` first, because templates read Doppler
   while they render.
2. Answer the `chezmoi init` prompts.
3. Review before applying: `chezmoi diff --use-builtin-diff`. The configured diff
   tool is `code --wait`, which opens VS Code.
4. Run `chezmoi apply`. Expect sudo prompts for packages. The Steam and VS Code
   Omarchy installers launch the app when they finish.

## Other Linux distros

The same repo works on plain Arch, Debian/Ubuntu and Fedora: packages come from
the distro's managers (see [Configuration](configuration.md#linux-package-managersyaml)),
and the bash rc falls back to `mise activate` + `starship init`. The Omarchy-only
parts (theme, bar, `.config/hypr`, `.config/omarchy`) are ignored.
