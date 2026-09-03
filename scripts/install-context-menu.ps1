# PowerShell Script to Register PureCheck AI Context Menu
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = (Resolve-Path "$ScriptDir\..").Path
$TargetBat = Join-Path $ProjectRoot "OPEN_FAST.bat"

$CmdFolder = "cmd.exe /c cd /d `"%1`" && `"$TargetBat`""
$CmdBg = "cmd.exe /c cd /d `"%V`" && `"$TargetBat`""

# Folder Right Click
New-Item -Path "HKCU:\Software\Classes\Directory\shell\PureCheckAI\command" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\shell\PureCheckAI" -Name "(default)" -Value "Launch PureCheck AI"
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\shell\PureCheckAI" -Name "Icon" -Value "imageres.dll,-5324"
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\shell\PureCheckAI\command" -Name "(default)" -Value $CmdFolder

# Folder Background Right Click
New-Item -Path "HKCU:\Software\Classes\Directory\Background\shell\PureCheckAI\command" -Force | Out-Null
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\Background\shell\PureCheckAI" -Name "(default)" -Value "Launch PureCheck AI"
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\Background\shell\PureCheckAI" -Name "Icon" -Value "imageres.dll,-5324"
Set-ItemProperty -Path "HKCU:\Software\Classes\Directory\Background\shell\PureCheckAI\command" -Name "(default)" -Value $CmdBg

Write-Host ""
Write-Host "[SUCCESS] 'Launch PureCheck AI' context menu option installed!" -ForegroundColor Green
