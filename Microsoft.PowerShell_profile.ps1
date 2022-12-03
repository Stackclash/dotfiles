$env:BW_SESSION=""

Invoke-Expression (&starship init powershell)
kubectl completion powershell | Out-String | Invoke-Expression
flux completion powershell | Out-String | Invoke-Expression
gh completion -s powershell | Out-String | Invoke-Expression
starship completions powershell | Out-String | Invoke-Expression