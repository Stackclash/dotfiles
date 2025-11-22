# Self-elevate the script
if (-Not ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] 'Administrator')) {  
  if ([int](Get-CimInstance -Class Win32_OperatingSystem | Select-Object -ExpandProperty BuildNumber) -ge 6000) {
    $CommandLine = "-NoExit -File `"" + $MyInvocation.MyCommand.Path + "`" " + $MyInvocation.UnboundArguments
    Start-Process -Wait -FilePath PowerShell.exe -Verb Runas -ArgumentList $CommandLine
    Exit
  }
}

# -------------------------------------------------------
# VS Code Extension Sync Script (PowerShell, templated)
# Reads profile definitions from .chezmoidata/vscode-profiles.yaml
# Syncs extensions per VS Code profile.
# -------------------------------------------------------

# Toggle removal of extensions not declared in YAML
$RemoveExtra = $false

# Ensure code CLI exists
if (-not (Get-Command "code" -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: VS Code command 'code' not found in PATH."
    exit 1
}

# Common Extensions (from YAML)
$CommonExtensions = @(
    "alefragnani.project-manager",
    "doppler.doppler-vscode",
    "eamodio.gitlens",
    "editorconfig.editorconfig",
    "github.vscode-pull-request-github",
    "gruntfuggly.todo-tree",
    "jannchie.codetime"
)

# Profile-specific extensions (from YAML)
$Profiles = @{
    "data" = @(
        "ms-toolsai.jupyter",
        "ms-toolsai.jupyter-keymap"
    );
    "devops" = @(
        "hashicorp.terraform",
        "redhat.vscode-yaml"
    );
    "web" = @(
        "dbaeumer.vscode-eslint",
        "ritwickdey.LiveServer"
    );
}

Write-Host "VS Code Extension Sync"
Write-Host "------------------------"

foreach ($profileName in $Profiles.Keys) {
    Write-Host ""
    Write-Host "=== Profile: $profileName ==="

    # Combine common + profile-specific
    $desiredExtensions = $CommonExtensions + $Profiles[$profileName]

    # Attempt to read installed extensions
    try {
        $installedExtensions = code --profile "$profileName" --list-extensions 2>$null
        if ($null -eq $installedExtensions) {
            $installedExtensions = @()
        }
    }
    catch {
        Write-Host "Could not list installed extensions for profile '$profileName'."
        Write-Host "Assuming no extensions installed."
        $installedExtensions = @()
    }

    # Install missing extensions
    foreach ($ext in $desiredExtensions) {
        if ($installedExtensions -notcontains $ext) {
            Write-Host "  + Installing: $ext"
            try {
                code --install-extension $ext --profile "$profileName" | Out-Null
            }
            catch {
                Write-Host "  ! Failed to install $ext"
            }
        } else {
            Write-Host "  ✓ Already installed: $ext"
        }
    }

    # Optionally remove extra extensions
    if ($RemoveExtra) {
        Write-Host "Checking for extensions to remove..."
        foreach ($ext in $installedExtensions) {
            if ($desiredExtensions -notcontains $ext) {
                Write-Host "  - Removing: $ext"
                try {
                    code --uninstall-extension $ext --profile "$profileName" | Out-Null
                }
                catch {
                    Write-Host "  ! Failed to remove $ext"
                }
            }
        }
    } else {
        Write-Host "  Skipping removal of undeclared extensions — set \$RemoveExtra = \$true to enable"
    }

    Write-Host "✓ Profile synced: $profileName"
}

Write-Host ""
Write-Host "All profiles processed."