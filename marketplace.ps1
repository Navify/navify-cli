$ErrorActionPreference = 'Stop'
$navify = Join-Path $env:LOCALAPPDATA 'navify\navify.exe'
$data = Join-Path $env:APPDATA 'navify'
$app = Join-Path $data 'CustomApps\marketplace'
$source = Join-Path (Split-Path -Parent $PSScriptRoot) 'marketplace\dist'

if (-not (Test-Path -LiteralPath $navify)) {
    Write-Host 'Navify is not installed. Run install.bat first.'
    Read-Host 'Press Enter to close'
    exit 1
}

Write-Host ''
Write-Host 'Navify Marketplace'
Write-Host ''
Write-Host '1. Enable Marketplace'
Write-Host '2. Disable Marketplace'
Write-Host '3. Exit'
Write-Host ''
$choice = Read-Host 'Choose an option'

if ($choice -eq '1') {
    if (-not (Test-Path -LiteralPath (Join-Path $source 'manifest.json'))) {
        Write-Host 'Marketplace build is missing. Run pnpm build:prod in the marketplace folder.'
        Read-Host 'Press Enter to close'
        exit 1
    }
    Get-Process Spotify -ErrorAction SilentlyContinue | Stop-Process -Force
    New-Item -ItemType Directory -Force -Path $app | Out-Null
    Get-ChildItem -LiteralPath $app -Force | Remove-Item -Recurse -Force
    Copy-Item -Path (Join-Path $source '*') -Destination $app -Recurse -Force
    & $navify config custom_apps marketplace
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $navify restore backup apply
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host ''
    Write-Host 'Marketplace enabled. Open Spotify normally.'
    Read-Host 'Press Enter to close'
    exit 0
}

if ($choice -eq '2') {
    Get-Process Spotify -ErrorAction SilentlyContinue | Stop-Process -Force
    & $navify config custom_apps marketplace-
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    & $navify apply
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    Write-Host ''
    Write-Host 'Marketplace disabled. Open Spotify normally.'
    Read-Host 'Press Enter to close'
    exit 0
}

exit 0
