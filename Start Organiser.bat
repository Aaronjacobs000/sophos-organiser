@echo off
title Sophos Personal Organiser

:: Launch via launch.ps1, which shows an immediate "Starting..." window, starts
:: the server (only if it isn't already running), and waits until it's actually
:: responding before opening the browser. This fixes the "have to click a few
:: times after a reboot" startup problem.
start "" powershell -NoProfile -ExecutionPolicy Bypass -WindowStyle Normal -File "%~dp0launch.ps1"
