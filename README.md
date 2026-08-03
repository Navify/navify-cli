<p align="center">
  <img src=".github/assets/logo.png" alt="Navify logo" width="220">
</p>

<h1 align="center">Navify CLI</h1>

<p align="center">
  <a href="https://goreportcard.com/report/github.com/Navify/navify-cli"><img src="https://goreportcard.com/badge/github.com/Navify/navify-cli"></a>
  <a href="https://github.com/Navify/navify-cli/releases/latest"><img src="https://img.shields.io/github/v/release/Navify/navify-cli?label=latest%20version"></a>
  <a href="https://github.com/Navify/navify-cli/releases"><img src="https://img.shields.io/github/downloads/Navify/navify-cli/total.svg?label=total%20downloads"></a>
  <a href="https://discord.gg/VnevqPp2Rr"><img src="https://img.shields.io/discord/842219447716151306?label=chat&logo=discord&logoColor=discord"></a>
</p>

---

Command-line tool to customize the official Spotify client.

Created by [HitBoyXx23](https://github.com/HitBoyXx23).
Supports Windows, MacOS and Linux.

### Installation

#### Windows

Double-click `install.bat`, or run it from Command Prompt:

```bat
install.bat
```

You can also run the PowerShell installer directly:

```powershell
iwr -useb https://raw.githubusercontent.com/Navify/navify-cli/main/install.ps1 | iex
```

#### macOS and Linux

Run:

```sh
curl -fsSL https://raw.githubusercontent.com/Navify/navify-cli/main/install.sh | sh
```

#### Build from source

Requires Go and pnpm.

```sh
git clone https://github.com/Navify/navify-cli.git
cd navify-cli
go build -o navify
```

Linux and macOS builds use the same source and automatically detect Spotify installed from a system package, Spotify Launcher, Flatpak, or Snap where supported. Build a native binary with:

```sh
GOOS=$(uname -s | tr '[:upper:]' '[:lower:]') GOARCH=$(uname -m | sed 's/x86_64/amd64/;s/aarch64/arm64/') go build -o navify
chmod +x navify
```

After installing, Navify keeps Spotify's normal appearance until you install and select a theme. Restart Spotify and run:

```sh
navify backup apply
```

### User folders

Place a theme folder containing `color.ini`, `user.css`, and optional `theme.js` or `assets` in the platform-specific Themes folder. The folder name is the theme name shown in Navify.

Windows:

```text
%APPDATA%\navify\Themes\YourTheme
```

Linux:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/navify/Themes/YourTheme
```

macOS:

```text
${XDG_CONFIG_HOME:-$HOME/.config}/navify/Themes/YourTheme
```

Navify also accepts `NAVIFY_CONFIG` when you want to store Themes, Extensions, and CustomApps in a different directory. After copying a theme, select it with `navify config current_theme YourTheme`, enable the theme settings, and run `navify apply`.

To return to Spotify's normal appearance:

```text
navify config current_theme "" inject_theme_js 0 inject_css 0 replace_colors 0 overwrite_assets 0
navify restore backup apply
```

### Features

- Change colors across the User Interface
- Inject CSS for advanced customization
- Inject Extensions to extend functionalities, manipulate UI and control player
- Inject Custom Apps
- Make yourself in control of the Spotify client

### Links

- [Installation](https://navify.app/docs/getting-started)
- [Basic Usage](https://navify.app/docs/getting-started#basic-usage)

---

### Code Signing Policy

Free code signing provided by [SignPath.io](https://signpath.io), certificate by [SignPath Foundation](https://signpath.org/).
