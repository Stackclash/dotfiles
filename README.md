<h1 align="center">
    <a name="top" title="dotfiles">~/.&nbsp;📂</a><br/>My Cross-Platform Dotfiles<br/> <sup><sub>powered by <a href="https://www.chezmoi.io/">chezmoi</a>
</h1>
<br />

[![Static Badge](https://img.shields.io/badge/Documentation-blue?style=for-the-badge&logo=gitbook)](https://stackclash.github.io/dotfiles)

A cross-platform, automated dotfiles setup powered by [chezmoi](https://chezmoi.io). This repo contains my macOS, Linux, and Windows configuration, along with scripts, templates, and documentation describing how everything works.

This project is designed to be reproducible, maintainable, and well-documented — ideal for quickly bringing up a new machine or keeping multiple systems in sync.

# Features
## 🔧 Cross-Platform Automation with chezmoi
- Declarative dotfiles using chezmoi templates (.tmpl)
- OS-specific bootstrap scripts:
- run_once_before_* automatic package manager setup
- run_onchange_* for idempotent application installs
- Separate workflows for macOS (Darwin) and Windows

## 🖌️ Theming & Configuration Data
- Centralized theme variables for use across templates
- App installation configuration
- Reusable template helpers (e.g., theme colors, PowerShell elevation)

## 🖥️ Shell & Terminal Environment
- PowerShell profiles for Windows
- Bash, Zsh, and Fish configs (.bashrc, .zshrc, fish/config.fish)
- Oh My Posh setup
- Git templates

## 💻 Application & Environment Setup

Automated install of:

Homebrew packages (macOS)

Windows package manager + apps (Windows)

VS Code extensions (cross-platform)

Support for mise, npm defaults, navi, and more

## 🔐 SSH & Private Configs

Private SSH keys & configs under private_dot_ssh/

Platform-specific private VS Code User settings

# Quick Start

Run this command on a fresh system to install chezmoi and initialize these dotfiles.

Windows (PowerShell)
```
powershell -NoProfile -ExecutionPolicy Bypass -Command "iwr https://raw.githubusercontent.com/Stackclash/dotfiles/main/bootstrap.ps1 | iex"
```
macOS / Linux (Shell)
```
sh -c "$(curl -fsSL https://raw.githubusercontent.com/Stackclash/dotfiles/main/bootstrap.sh)"
```

# To-Do
- Write documentation on Git, and SSH configuration
- Write documentation for Yubikey, Git templates and git-conventional-commits
- Write documentation on scripts
- Save VSCode configuration
- Create dotfile for iTerm
- research how to create aliases
- test setup with WSL
- need to add step to change user data location and app install location
- control startup apps and pinned apps and pinned folders
- upgrade powershell
- icloud isn't installed using choco (can we install using microsoft store)