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

# --- 3. Doppler CLI ---
# Templates call dopplerProjectJson while chezmoi renders the target state,
# which happens before any run_* script, so Doppler must exist and be logged
# in first. It comes from mise, the same install apps.yaml uses.
if (-not (Get-Command doppler -ErrorAction SilentlyContinue)) {
    if (-not (Get-Command mise -ErrorAction SilentlyContinue)) {
        Write-Host "📦 Installing mise with WinGet..."
        winget install --id jdx.mise --exact --silent --accept-package-agreements --accept-source-agreements
        $env:Path = @($env:Path, [Environment]::GetEnvironmentVariable('Path', 'Machine'), [Environment]::GetEnvironmentVariable('Path', 'User')) -join ';'
    }
    Write-Host "📦 Installing Doppler CLI with mise..."
    mise use -g github:DopplerHQ/cli@latest
    $env:Path = (Join-Path $env:LOCALAPPDATA 'mise\shims') + ';' + $env:Path
    if (-not (Get-Command doppler -ErrorAction SilentlyContinue)) {
        Write-Error "❌ Failed to install the Doppler CLI."
        exit 1
    }
}
# Windows PowerShell turns redirected native stderr into a terminating error
# under "Stop", so relax it for this check.
$ErrorActionPreference = "Continue"
doppler me *> $null
$dopplerLoggedIn = $LASTEXITCODE -eq 0
$ErrorActionPreference = "Stop"
if (-not $dopplerLoggedIn) {
    Write-Host "🔑 Logging in to Doppler..."
    doppler login
}

# --- 4. Initialize your repo ---
Write-Host "🚀 Initializing Stackclash dotfiles..."
chezmoi init --apply Stackclash

Write-Host "🎉 Dotfiles setup complete!"