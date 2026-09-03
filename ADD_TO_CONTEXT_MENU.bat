@echo off
title Add PureCheck AI to Explorer Context Menu
cls

echo =========================================================================
echo            ADD PURECHECK AI TO WINDOWS CONTEXT MENU
echo =========================================================================
echo.
echo Registering "Launch PureCheck AI" option in File Explorer...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\install-context-menu.ps1"

echo.
echo [!] You can now right-click any folder or inside the PureCheck folder
echo     in File Explorer and select "Launch PureCheck AI" to open it!
echo.
pause
