# Check if config file exists
$chezmoiConfigDir = Join-Path $HOME ".config/chezmoi"
$chezmoiConfigFile = Join-Path $chezmoiConfigDir "chezmoi.json"

if (-not (Test-Path $chezmoiConfigFile)) {
    Write-Output "=== ERROR: No chezmoi.json found ==="
    exit 1
}

# Load config file into memory
$chezmoiConfig = Get-Content $chezmoiConfigFile -Raw | ConvertFrom-Json

# Ensure themes block exists
if (-not $chezmoiConfig.data.themes) {
    $chezmoiConfig.data | Add-Member -NotePropertyName "theme" -NotePropertyValue (@{}) -Force
}

# Get colorscheme (default if missing)
if ($chezmoiConfig.data.theme.colorscheme) {
    $themeColorScheme = $chezmoiConfig.data.theme.colorscheme
} else {
    $themeColorScheme = "default"
    $chezmoiConfig.data.theme.colorscheme = $themeColorScheme
}

# Find theme scheme files
$themesConfigDir = Join-Path $HOME ".config/themes"

$themeSchemeFiles = @{}
if (Test-Path $themesConfigDir) {
    Get-ChildItem -Path $themesConfigDir -File | ForEach-Object {
        $name = $_.BaseName
        $themeSchemeFiles[$name] = $_.FullName
    }
}

# Ensure the theme exists
if (-not $themeSchemeFiles.ContainsKey($themeColorScheme)) {
    Write-Output "=== ERROR: Theme '$themeColorScheme' not found in $themesConfigDir ==="
    exit 1
}

# Load selected theme JSON
$themeData = Get-Content $themeSchemeFiles[$themeColorScheme] -Raw | ConvertFrom-Json

# Add theme colors into chezmoi config
$chezmoiConfig.data.theme.colors = $themeData

# Save updated config
$chezmoiConfig | ConvertTo-Json -Depth 20 | Set-Content $chezmoiConfigFile

Write-Output "=== SUCCESS ==="