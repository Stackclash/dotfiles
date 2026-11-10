---
title: Introduction
---

# Dotfiles Documentation

Welcome to the documentation for my **chezmoi-powered cross-platform dotfiles**.

This site provides a deeper, structured explanation of how the repository works, how to customize it, and how scripts, templates, themes, and configuration files fit together.

## Overview

This project uses **chezmoi** to manage configurations for:

- Windows
- macOS
- Linux, with first-class [Omarchy](omarchy.md) support (plain Arch, Debian/Ubuntu and Fedora also work)

The dotfiles are structured to be **idempotent, portable, templatized, and data-driven**.

## Quick Start

To install these dotfiles, run the installer appropriate for your platform:

```md
{%
    include-markdown "../../README.md"
    start="## Quick Start"
    end="---"
%}
```

## Documentation Sections
- [Scripts](scripts.md): automation scripts in `.chezmoiscripts/`
- [Templates](templates.md): reusable components in `.chezmoitemplates/`
- [Configuration](configuration.md): how data in `.chezmoidata/` drives the dotfiles, including per-distro Linux packages
- [AI Tools](ai-tools.md): MCP servers, plugins, skills and packages for AI agents
- [Themes](themes.md): how the theme system works
- [Omarchy](omarchy.md): what Omarchy owns and what chezmoi manages on top of it

## Source Code
All files referenced in this documentation exist in the GitHub repo.
You can explore them directly here:

👉 https://github.com/Stackclash/dotfiles