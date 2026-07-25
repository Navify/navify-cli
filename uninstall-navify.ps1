$ErrorActionPreference = 'Stop'
$install = Join-Path $env:LOCALAPPDATA 'navify'
$data = Join-Path $env:APPDATA 'navify'
$navify = Join-Path $install 'navify.exe'
$shortcut = Join-Path ([Environment]::GetFolderPath('Desktop')) 'Navify Spotify.lnk'

Get-Process Spotify -ErrorAction SilentlyContinue | Stop-Process -Force

if (Test-Path -LiteralPath $navify) {
    & $navify config custom_apps marketplace- extensions- current_theme "" color_scheme "" inject_theme_js 0 inject_css 0 replace_colors 0 overwrite_assets 0
    & $navify restore
}

$userPath = [Environment]::GetEnvironmentVariable('Path', 'User')
$parts = @($userPath -split ';' | Where-Object { $_ -and $_.TrimEnd('\') -ine $install.TrimEnd('\') })
[Environment]::SetEnvironmentVariable('Path', ($parts -join ';'), 'User')

if (Test-Path -LiteralPath $shortcut) {
    Remove-Item -LiteralPath $shortcut -Force
}
if (Test-Path -LiteralPath $data) {
    Remove-Item -LiteralPath $data -Recurse -Force
}
if (Test-Path -LiteralPath $install) {
    Remove-Item -LiteralPath $install -Recurse -Force
}

Write-Host ''
Write-Host 'Navify was uninstalled and Spotify was restored.'
Read-Host 'Press Enter to close'
