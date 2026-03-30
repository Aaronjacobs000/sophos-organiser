# Sophos Personal Organiser — Local Server
# Serves static files and provides a /save endpoint for persistent data storage
# No dependencies required — uses built-in PowerShell/.NET HTTP listener

param(
    [int]$Port = 8080
)

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$url = "http://localhost:$Port/"

# MIME types for static files
$mimeTypes = @{
    '.html' = 'text/html; charset=utf-8'
    '.css'  = 'text/css; charset=utf-8'
    '.js'   = 'application/javascript; charset=utf-8'
    '.json' = 'application/json; charset=utf-8'
    '.svg'  = 'image/svg+xml'
    '.png'  = 'image/png'
    '.ico'  = 'image/x-icon'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)

try {
    $listener.Start()
} catch {
    Write-Host ""
    Write-Host "  ERROR: Could not start server on port $Port." -ForegroundColor Red
    Write-Host "  Another application may be using this port." -ForegroundColor Red
    Write-Host "  Close that application and try again, or edit Start Organiser.bat to use a different port." -ForegroundColor Red
    Write-Host ""
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host ""
Write-Host "  Sophos Personal Organiser" -ForegroundColor Cyan
Write-Host "  =========================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Running at: $url" -ForegroundColor Green
Write-Host "  Data file:  $root\data.json" -ForegroundColor Green
Write-Host ""
Write-Host "  Keep this window open while using the organiser." -ForegroundColor Yellow
Write-Host "  Close this window or press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $path = $request.Url.LocalPath

        # --- POST /api/save — write data.json ---
        if ($request.HttpMethod -eq 'POST' -and $path -eq '/api/save') {
            $reader = New-Object System.IO.StreamReader($request.InputStream, $request.ContentEncoding)
            $body = $reader.ReadToEnd()
            $reader.Close()

            $dataFile = Join-Path $root 'data.json'
            [System.IO.File]::WriteAllText($dataFile, $body, [System.Text.Encoding]::UTF8)

            $response.StatusCode = 200
            $response.ContentType = 'application/json; charset=utf-8'
            $responseBytes = [System.Text.Encoding]::UTF8.GetBytes('{"status":"saved"}')
            $response.OutputStream.Write($responseBytes, 0, $responseBytes.Length)
            $response.Close()

            $timestamp = Get-Date -Format "HH:mm:ss"
            Write-Host "  [$timestamp] Data saved" -ForegroundColor DarkGray
            continue
        }

        # --- GET /api/load — read data.json ---
        if ($request.HttpMethod -eq 'GET' -and $path -eq '/api/load') {
            $dataFile = Join-Path $root 'data.json'
            if (Test-Path $dataFile) {
                $content = [System.IO.File]::ReadAllText($dataFile, [System.Text.Encoding]::UTF8)
                $response.StatusCode = 200
                $response.ContentType = 'application/json; charset=utf-8'
            } else {
                $content = 'null'
                $response.StatusCode = 200
                $response.ContentType = 'application/json; charset=utf-8'
            }
            $responseBytes = [System.Text.Encoding]::UTF8.GetBytes($content)
            $response.OutputStream.Write($responseBytes, 0, $responseBytes.Length)
            $response.Close()
            continue
        }

        # --- Static file serving ---
        if ($path -eq '/') { $path = '/index.html' }
        $filePath = Join-Path $root ($path.TrimStart('/').Replace('/', '\'))

        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath)
            $contentType = $mimeTypes[$ext]
            if (-not $contentType) { $contentType = 'application/octet-stream' }

            $response.StatusCode = 200
            $response.ContentType = $contentType
            $fileBytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.OutputStream.Write($fileBytes, 0, $fileBytes.Length)
        } else {
            $response.StatusCode = 404
            $responseBytes = [System.Text.Encoding]::UTF8.GetBytes('Not found')
            $response.OutputStream.Write($responseBytes, 0, $responseBytes.Length)
        }

        $response.Close()
    } catch [System.Net.HttpListenerException] {
        # Listener was stopped
        break
    } catch {
        Write-Host "  Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}
