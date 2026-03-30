@echo off
title Sophos Personal Organiser

:: Start the server in background and open browser
start "" powershell -ExecutionPolicy Bypass -WindowStyle Normal -File "%~dp0server.ps1"

:: Wait a moment for the server to start, then open the browser
timeout /t 2 /nobreak >nul
start "" "http://localhost:8080"
