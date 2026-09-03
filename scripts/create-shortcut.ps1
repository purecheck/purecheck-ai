# PowerShell Script to Create Desktop Shortcut
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir\..").Path
$TargetBat = Join-Path $ProjectRoot "OPEN_FAST.bat"
$DesktopPath = [Environment]::GetFolderPath('Desktop')
$ShortcutPath = Join-Path $DesktopPath "PureCheck AI.lnk"

$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = $TargetBat
$Shortcut.WorkingDirectory = $ProjectRoot
$Shortcut.IconLocation = "imageres.dll,5324"
$Shortcut.Save()

Write-Host ""
Write-Host "[SUCCESS] Desktop shortcut created at: $ShortcutPath" -ForegroundColor Green
