---
title: Configuration Data
---

# Configuration Data (`.chezmoidata` + `.chezmoi.json.tmpl`)

Every dynamic setting lives in YAML under `home/.chezmoidata/`. Templates and
scripts read each file's top-level key (for example `.apps`). Edit a file and run
`chezmoi apply`: the `run_onchange_*` scripts embed a hash of the data they
read, so they re-run on their own.

```
home/.chezmoidata/
├── apps.yaml                     # .apps
├── linux-package-managers.yaml   # .linuxPackageManagers
├── omarchy.yaml                  # .omarchyPrefs
├── ai-tools.yaml                 # .aiTools   (see AI Tools)
├── ai-agents.yaml                # .aiAgents  (see AI Tools)
├── themes.yaml                   # .themes    (see Themes)
└── vscode-profiles.yaml          # .vscodeProfiles
```

## apps.yaml

One entry per app, with a block for each OS it installs on. An app with no block
for an OS is skipped there. `forPersonal: true` skips the app on work machines.

```yaml
apps:
  vscode:
    forPersonal: false
    windows: { id: "Microsoft.VisualStudioCode", method: winget }   # winget | choco
    darwin:  { id: "visual-studio-code", method: brew-cask }       # brew | brew-cask | brew-tap
    linux:
      omarchy: { installer: editor-vscode, package: visual-studio-code-bin }
      aur: visual-studio-code-bin
```

The `linux:` block maps each **package manager to a package name**. The install
script uses the first manager in this distro's list
([below](#linux-package-managersyaml)) that the app defines. `omarchy:` takes one of:

- `shipped`: Omarchy already provides the app, so nothing runs
- `{ installer, package }`: runs `omarchy-install-<installer>` only when `<package>` is missing. Those installers also configure and launch the app.

> [!IMPORTANT]
> `apps.yaml` holds only what **mise can't manage**: apps with no mise build, or
> ones that need the OS package (Docker CLI plugins, syncthing's systemd unit,
> PowerShell as a system shell). Everything mise can install goes in
> `dot_config/mise/config.toml.tmpl`.

Omarchy's base apps that mise can't install (chromium, mpv, localsend, …) are
listed as `omarchy: shipped` plus pacman/apt/dnf names, so any other Linux
machine gets the same setup.

### Omarchy and the mise config

Omarchy also ships CLI tools of its own:

- **Through pacman:** bat, eza, fzf, ripgrep, zoxide, lazygit, neovim, starship and others. The mise config puts these in an `{{ if not (includeTemplate "is-omarchy" .) }}` block, so they're installed everywhere except Omarchy.
- **Through mise itself** (`/etc/mise/conf.d/omarchy-tools.toml`): gh, copilot, codex, node, uv and others, installed lazily and auto-updated. The mise template reads that file when it exists and skips any **unpinned** (`"latest"`) entry Omarchy already declares, so Omarchy stays in charge and nothing installs twice. Pinned entries such as `node = "22"` still apply. Declare these with their registry short names (`gh`, not `github:cli/cli`) so the keys match.

When a tool has no build for every OS, limit it with mise's `os` option, for
example `tmux = { version = "latest", os = ["linux", "macos"] }`.

## linux-package-managers.yaml

The package managers to try for each distro, keyed by `/etc/os-release` ID:

```yaml
linuxPackageManagers:
  omarchy: [omarchy, pacman, aur]
  arch: [pacman, aur]
  debian: [apt]
  fedora: [dnf]
```

The script matches `.chezmoi.osRelease.id` first, then each word of
`.chezmoi.osRelease.idLike`, so Manjaro uses `arch` and Ubuntu uses `debian`.
On Omarchy, `pacman`/`aur` go through `omarchy-pkg-add` / `omarchy-pkg-aur-add`.
Elsewhere they use `pacman`/`yay` (or `paru`). `apt` and `dnf` use `install -y`.

To override the list on one machine, add it to `~/.config/chezmoi/chezmoi.json`:

```json
{ "data": { "packageManagers": ["pacman", "aur"] } }
```

Adding a distro takes one entry. Adding a new manager also needs one `case`
branch in `install_with` (and `upgrade_with`) in `Linux/run_02-install-apps.sh.tmpl`.

## omarchy.yaml

Omarchy desktop preferences, applied only on Omarchy. See [Omarchy](omarchy.md).

## vscode-profiles.yaml

`common_extensions` go into base VS Code and every profile. `profiles.<name>.extensions`
are added per profile. Synced by the `run_03-setup-vscode-profiles` scripts.

## .chezmoi.json.tmpl: machine variables

Prompts asked once on `chezmoi init`, stored in `~/.config/chezmoi/chezmoi.json`:

| Variable | Description |
|----------|-------------|
| `.name`, `.email` | Identity |
| `.workComputer` | Skips `forPersonal` apps and enables work-repo cloning |
| `.setupWork` | Only asked when `workComputer` is false. Enables work identity and work-repo cloning without skipping `forPersonal` apps |
| `.workEmail`, `.workGithubOrg` | Only asked when `workComputer` or `setupWork` is true |
| `.githubUsername`, `.projectPath` | Repo cloning |
| `.context7ApiKey` | Optional MCP key |
| `.theme` | Theme from `themes.yaml` (Windows Terminal / VS Code) |

To change an answer later, edit `~/.config/chezmoi/chezmoi.json`, or run
`chezmoi init --prompt` to be asked every question again.

## OS detection

Use chezmoi's built-in data, not custom flags:

```gotmpl
{{ if eq .chezmoi.os "linux" }}...{{ end }}                  {{/* windows | darwin | linux */}}
{{ if includeTemplate "is-omarchy" . }}...{{ end }}         {{/* Omarchy only */}}
```

`.chezmoi.osRelease` only exists on Linux. The `is-omarchy` template checks
`.chezmoi.os` first, then `.chezmoi.osRelease.id == "omarchy"`.
