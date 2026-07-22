# Sync user AI skills and agents from ~/.ai into Claude Code and GitHub Copilot for Azure

$aiSkillsDir  = Join-Path $env:USERPROFILE '.ai\skills'
$aiAgentsDir  = Join-Path $env:USERPROFILE '.ai\agents'
$claudeSkills = Join-Path $env:USERPROFILE '.claude\skills'
$claudeAgents = Join-Path $env:USERPROFILE '.claude\agents'
$copilotSkills   = Join-Path $env:USERPROFILE '.agents\skills'
$copilotManifest = Join-Path $env:USERPROFILE '.agents\.copilot-for-azure-skills-manifest.json'

function Set-Symlink {
    param([string]$Link, [string]$Target)
    if (Test-Path $Link -PathType Any) {
        $item = Get-Item $Link -Force
        if ($item.LinkType -eq 'SymbolicLink' -and $item.Target -eq $Target) { return }
        Remove-Item $Link -Force -Recurse
    }
    try {
        New-Item -ItemType SymbolicLink -Path $Link -Target $Target | Out-Null
    } catch {
        Write-Warning "Could not create symlink '$Link': $_"
    }
}

foreach ($dir in @($claudeSkills, $claudeAgents)) {
    if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Force $dir | Out-Null }
}

# Sync skills -> Claude and Copilot for Azure
if (Test-Path $aiSkillsDir) {
    $userSkillNames = @()

    Get-ChildItem -Path $aiSkillsDir -Directory | ForEach-Object {
        $userSkillNames += $_.Name
        Set-Symlink -Link (Join-Path $claudeSkills $_.Name) -Target $_.FullName
        if (Test-Path $copilotSkills) {
            Set-Symlink -Link (Join-Path $copilotSkills $_.Name) -Target $_.FullName
        }
    }

    # Add user skills to the Copilot for Azure manifest without removing extension-managed ones
    if ($userSkillNames.Count -gt 0 -and (Test-Path $copilotManifest)) {
        $manifest  = Get-Content $copilotManifest -Raw | ConvertFrom-Json
        $existing  = [System.Collections.Generic.HashSet[string]]::new(
            [string[]]($manifest.skills ?? @()),
            [System.StringComparer]::OrdinalIgnoreCase
        )
        $userSkillNames | ForEach-Object { $existing.Add($_) | Out-Null }
        $manifest.skills = @($existing | Sort-Object)
        $manifest | ConvertTo-Json -Depth 10 | Set-Content $copilotManifest -Encoding UTF8
    }
}

# Sync agents -> Claude only (Copilot agents are extension-defined)
if (Test-Path $aiAgentsDir) {
    Get-ChildItem -Path $aiAgentsDir -Directory | ForEach-Object {
        Set-Symlink -Link (Join-Path $claudeAgents $_.Name) -Target $_.FullName
    }
}
