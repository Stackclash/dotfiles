#### BITWARDEN SESSION ENVIRONMENT VARIABLE
$env:BW_SESSION=""

#### INITIALIZE STARSHIP
Invoke-Expression (&starship init powershell)

#### ADD TAB COMPLETIONS
chezmoi completion powershell | Out-String | Invoke-Expression
flux completion powershell | Out-String | Invoke-Expression
gh completion -s powershell | Out-String | Invoke-Expression
kubectl completion powershell | Out-String | Invoke-Expression
starship completions powershell | Out-String | Invoke-Expression

#### SET ENVIRONMENT VARIABLES
$env:SSH_AUTH_SOCK = "\\.\pipe\ssh-pageant"

#### START GPG-AGENT
(gpg-connect-agent killagent /bye) *> $null
(gpg-connect-agent /bye) *> $null
gpgconf --launch gpg-agent