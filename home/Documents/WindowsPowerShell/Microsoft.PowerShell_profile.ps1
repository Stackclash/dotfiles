#### INITIALIZE STARSHIP
Invoke-Expression (&starship init powershell)

#### ADD TAB COMPLETIONS
chezmoi completion powershell | Out-String | Invoke-Expression
gh completion -s powershell | Out-String | Invoke-Expression
kubectl completion powershell | Out-String | Invoke-Expression
starship completions power-shell | Out-String | Invoke-Expression

#### ACTIVATE MISE ENVIRONMENT
mise activate pwsh | Out-String | Invoke-Expression

Clear-Host