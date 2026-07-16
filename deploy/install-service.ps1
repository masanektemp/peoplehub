# MSNC PeopleHub — Install sebagai Windows Service (NSSM)
# Jalankan sebagai Administrator di Windows Server
#
# Keperluan:
#   1. Node.js LTS (https://nodejs.org)
#   2. NSSM — muat turun dari https://nssm.cc/download
#      Letakkan nssm.exe di C:\nssm\nssm.exe atau dalam PATH
#
# Usage:
#   .\deploy\install-service.ps1
#   .\deploy\install-service.ps1 -Uninstall

param(
    [string]$ServiceName = "MSNCPeopleHub",
    [int]$Port = 3000,
    [switch]$Uninstall
)

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ServerJs = Join-Path $ProjectRoot ".next\standalone\server.js"
$NodeExe = (Get-Command node -ErrorAction SilentlyContinue).Source

# Cari NSSM
$Nssm = @(
    "C:\nssm\nssm.exe",
    "C:\tools\nssm\nssm.exe",
    "$env:ProgramFiles\nssm\nssm.exe"
) | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $Nssm) {
    $NssmCmd = Get-Command nssm -ErrorAction SilentlyContinue
    if ($NssmCmd) { $Nssm = $NssmCmd.Source }
}

if ($Uninstall) {
    if (-not $Nssm) { Write-Host "[RALAT] NSSM tidak dijumpai." -ForegroundColor Red; exit 1 }
    & $Nssm stop $ServiceName confirm
    & $Nssm remove $ServiceName confirm
    Write-Host "Service '$ServiceName' dibuang." -ForegroundColor Green
    exit 0
}

if (-not $NodeExe) {
    Write-Host "[RALAT] Node.js tidak dijumpai. Install Node.js LTS dahulu." -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $ServerJs)) {
    Write-Host "[RALAT] $ServerJs tidak wujud. Jalankan deploy\build-production.bat dahulu." -ForegroundColor Red
    exit 1
}

if (-not $Nssm) {
    Write-Host "[RALAT] NSSM tidak dijumpai." -ForegroundColor Red
    Write-Host "Muat turun NSSM: https://nssm.cc/download" -ForegroundColor Yellow
    Write-Host "Letakkan di C:\nssm\nssm.exe" -ForegroundColor Yellow
    exit 1
}

Write-Host "Installing Windows Service: $ServiceName" -ForegroundColor Cyan
Write-Host "  Node:    $NodeExe"
Write-Host "  App:     $ServerJs"
Write-Host "  Port:    $Port"
Write-Host "  Root:    $ProjectRoot"

# Buang service lama jika wujud
$existing = Get-Service -Name $ServiceName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "Service sedia ada — buang dan pasang semula..." -ForegroundColor Yellow
    & $Nssm stop $ServiceName confirm 2>$null
    & $Nssm remove $ServiceName confirm 2>$null
    Start-Sleep -Seconds 2
}

& $Nssm install $ServiceName $NodeExe $ServerJs
& $Nssm set $ServiceName AppDirectory (Join-Path $ProjectRoot ".next\standalone")
& $Nssm set $ServiceName AppEnvironmentExtra "PORT=$Port" "HOSTNAME=0.0.0.0" "NODE_ENV=production"
& $Nssm set $ServiceName DisplayName "MSNC PeopleHub HRMS"
& $Nssm set $ServiceName Description "HRMS Enterprise on-premise — MSNC PeopleHub"
& $Nssm set $ServiceName Start SERVICE_AUTO_START
& $Nssm set $ServiceName AppStdout (Join-Path $ProjectRoot "logs\service-stdout.log")
& $Nssm set $ServiceName AppStderr (Join-Path $ProjectRoot "logs\service-stderr.log")
& $Nssm set $ServiceName AppRotateFiles 1
& $Nssm set $ServiceName AppRotateBytes 10485760

New-Item -ItemType Directory -Force -Path (Join-Path $ProjectRoot "logs") | Out-Null

& $Nssm start $ServiceName

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " Service '$ServiceName' BERJAYA dipasang" -ForegroundColor Green
Write-Host " App berjalan di http://localhost:$Port" -ForegroundColor Green
Write-Host " Seterusnya: setup IIS reverse proxy" -ForegroundColor Green
Write-Host "   .\deploy\setup-iis.ps1" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green