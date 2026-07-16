# MSNC PeopleHub — Setup IIS Reverse Proxy ke Node.js
# Jalankan sebagai Administrator
#
# Keperluan IIS:
#   - Web Server (IIS) role
#   - URL Rewrite Module 2.x
#   - Application Request Routing (ARR) 3.x
#     Enable proxy: IIS Manager > Server > Application Request Routing Cache
#                  > Server Proxy Settings > Enable proxy = True
#
# Usage:
#   .\deploy\setup-iis.ps1 -SiteName "PeopleHub" -HostHeader "hrms.company.com"
#   .\deploy\setup-iis.ps1 -SiteName "PeopleHub" -Port 443 -UseHttps

param(
    [string]$SiteName = "MSNCPeopleHub",
    [string]$HostHeader = "",
    [int]$Port = 80,
    [switch]$UseHttps,
    [string]$CertThumbprint = "",
    [string]$PhysicalPath = ""
)

$ErrorActionPreference = "Stop"

if (-not ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {
    Write-Host "[RALAT] Jalankan PowerShell sebagai Administrator." -ForegroundColor Red
    exit 1
}

Import-Module WebAdministration -ErrorAction Stop

$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
if (-not $PhysicalPath) {
    $PhysicalPath = Join-Path $ProjectRoot "deploy\iis"
}

$WebConfigSource = Join-Path $PhysicalPath "web.config"
if (-not (Test-Path $WebConfigSource)) {
    Write-Host "[RALAT] web.config tidak dijumpai di $PhysicalPath" -ForegroundColor Red
    exit 1
}

# Semak URL Rewrite
$rewriteDll = "${env:ProgramFiles}\IIS\Microsoft URL Rewrite Module\rewrite.dll"
if (-not (Test-Path $rewriteDll)) {
    Write-Host "[AMARAN] URL Rewrite Module mungkin belum dipasang." -ForegroundColor Yellow
    Write-Host "Muat turun: https://www.iis.net/downloads/microsoft/url-rewrite" -ForegroundColor Yellow
}

# Buang site lama jika wujud
if (Get-Website -Name $SiteName -ErrorAction SilentlyContinue) {
    Write-Host "Buang site IIS sedia ada: $SiteName" -ForegroundColor Yellow
    Remove-Website -Name $SiteName
}

New-Item -ItemType Directory -Force -Path $PhysicalPath | Out-Null
Copy-Item $WebConfigSource (Join-Path $PhysicalPath "web.config") -Force

New-Website -Name $SiteName -PhysicalPath $PhysicalPath -Port $Port -HostHeader $HostHeader -Force | Out-Null

if ($UseHttps) {
    if (-not $CertThumbprint) {
        Write-Host "[RALAT] -CertThumbprint diperlukan untuk HTTPS." -ForegroundColor Red
        exit 1
    }
    Remove-WebBinding -Name $SiteName -BindingInformation "*:${Port}:$HostHeader" -ErrorAction SilentlyContinue
    New-WebBinding -Name $SiteName -Protocol "https" -Port 443 -HostHeader $HostHeader -SslFlags 1
    $binding = Get-WebBinding -Name $SiteName -Protocol "https"
    $binding.AddSslCertificate($CertThumbprint, "my")
    Write-Host "HTTPS binding ditambah pada port 443" -ForegroundColor Green
}

# Enable ARR proxy (perlu dibuat manual sekali di IIS Manager jika gagal)
try {
    Set-WebConfigurationProperty -pspath "MACHINE/WEBROOT/APPHOST" -filter "system.webServer/proxy" -name "enabled" -value "True" -ErrorAction Stop
    Write-Host "ARR proxy diaktifkan." -ForegroundColor Green
} catch {
    Write-Host "[AMARAN] ARR proxy — aktifkan manual di IIS Manager:" -ForegroundColor Yellow
    Write-Host "  Server > Application Request Routing Cache > Server Proxy Settings > Enable proxy" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host " IIS Site '$SiteName' SIAP" -ForegroundColor Green
if ($HostHeader) {
    Write-Host " URL: http://$HostHeader" -ForegroundColor Green
} else {
    Write-Host " URL: http://localhost:$Port" -ForegroundColor Green
}
Write-Host " Reverse proxy -> http://localhost:3000" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green