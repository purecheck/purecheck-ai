# PowerShell Script to Unregister PureCheck AI Context Menu
Remove-Item -Path "HKCU:\Software\Classes\Directory\shell\PureCheckAI" -Recurse -ErrorAction SilentlyContinue
Remove-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\PureCheckAI" -Recurse -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "[SUCCESS] 'Launch PureCheck AI' context menu option removed!" -ForegroundColor Green
