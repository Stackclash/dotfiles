mise x ubi:cli/cli[exe=gh] -- gh auth status >$null 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Output "Log In"
} else {
    Write-Output "Already Logged In"
}