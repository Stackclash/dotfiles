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
- Linux  

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
Scripts: All automation scripts in .chezmoiscripts/
Templates: Reusable components in .chezmoitemplates/
Configuration: How data in .chezmoidata/ drives your dotfiles
Themes: How the theme system works
Applications: How applications are installed

## Source Code
All files referenced in this documentation exist in the GitHub repo.
You can explore them directly here:

👉 https://github.com/Stackclash/dotfiles