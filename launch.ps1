# Sophos Personal Organiser — Launcher
# Starts the local server (once) and only opens the browser after the server is
# actually responding. This fixes the "have to click the launcher three or four
# times after a reboot" problem: a cold PowerShell + HttpListener can take ~10s
# (longer after a reboot, with OneDrive hydrating), so a fixed short wait meant
# the browser hit a dead port and the user re-clicked, spawning duplicate
# servers that then fought over the port.

param(
    [int]$Port = 8080
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url  = "http://localhost:$Port/"

function Test-ServerUp {
    try {
        Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 2 | Out-Null
        return $true
    } catch {
        return $false
    }
}

Write-Host ""
Write-Host "  Starting Sophos Personal Organiser..." -ForegroundColor Cyan
Write-Host "  (this can take a few seconds, longer after a reboot)" -ForegroundColor DarkGray
Write-Host ""

# If a server is already running (launched earlier, or the user double-clicked
# again), don't start a second one — just open the browser.
if (Test-ServerUp) {
    Start-Process $url
    exit 0
}

# Start the server in its own window so it keeps running while the organiser is
# open. -NoProfile speeds up the cold start. If several launchers race after
# multiple clicks, the duplicate servers exit quietly via the mutex in server.ps1.
Start-Process powershell -ArgumentList @(
    '-NoProfile', '-ExecutionPolicy', 'Bypass', '-WindowStyle', 'Normal',
    '-File', "`"$root\server.ps1`"", '-Port', "$Port"
)

# Wait until the server is genuinely responding before opening the browser
# (poll every 0.5s, up to ~60s for a slow cold boot / OneDrive hydration).
for ($i = 0; $i -lt 120; $i++) {
    Start-Sleep -Milliseconds 500
    if (Test-ServerUp) {
        Start-Process $url
        exit 0
    }
}

# Server didn't come up in time — open anyway so the user can see the server
# window and any error it printed.
Write-Host "  Server is taking longer than expected. Opening the browser anyway." -ForegroundColor Yellow
Start-Process $url
