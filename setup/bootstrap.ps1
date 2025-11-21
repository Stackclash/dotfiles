<#
.SYNOPSIS
Bootstrap script to install chezmoi and initialize the Stackclash dotfiles.
#>

# Stop on errors
$ErrorActionPreference = "Stop"

Write-Host "🔧 Starting dotfiles bootstrap..." -ForegroundColor Cyan

# --- 1. Detect OS / Architecture ---
$os = "windows"
$arch = if ([Environment]::Is64BitOperatingSystem) { "amd64" } else { "386" }

# --- 2. Install chezmoi if missing ---
if (-not (Get-Command chezmoi -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Installing chezmoi..."

    $installScript = Invoke-WebRequest -UseBasicParsing `
        -Uri "https://chezmoi.io/get"

    # Execute installer (PowerShell install supported by chezmoi)
    Invoke-Expression $installScript.Content

    if (-not (Get-Command chezmoi -ErrorAction SilentlyContinue)) {
        Write-Error "❌ Failed to install chezmoi."
        exit 1
    }
} else {
    Write-Host "✔ chezmoi is already installed."
}

# --- 3. Initialize your repo ---
Write-Host "🚀 Initializing Stackclash dotfiles..."
chezmoi init --apply Stackclash

Write-Host "🎉 Dotfiles setup complete!"