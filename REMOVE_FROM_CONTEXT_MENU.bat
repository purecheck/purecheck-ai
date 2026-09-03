@echo off
title Remove PureCheck AI from Explorer Context Menu
cls

echo =========================================================================
echo         REMOVE PURECHECK AI FROM WINDOWS CONTEXT MENU
echo =========================================================================
echo.
echo Removing "Launch PureCheck AI" option from File Explorer...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\uninstall-context-menu.ps1"

echo.
pause
