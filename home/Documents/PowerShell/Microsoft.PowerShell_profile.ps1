#### INITIALIZE MISE
mise activate pwsh | Out-String | Invoke-Expression
mise install

#### INITIALIZE OH-MY-POSH
oh-my-posh init pwsh --config "tokyo" | Invoke-Expression

#### ADD TAB COMPLETIONS
chezmoi completion powershell | Out-String | Invoke-Expression
gh completion -s powershell | Out-String | Invoke-Expression
kubectl completion powershell | Out-String | Invoke-Expression

Clear-Host