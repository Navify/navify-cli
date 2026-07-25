<h3 align="center"><a href="https://navify.app/"><img src="https://i.imgur.com/iwcLITQ.png" width="600px"></a></h3>
<p align="center">
  <a href="https://goreportcard.com/report/github.com/navify/cli"><img src="https://goreportcard.com/badge/github.com/navify/cli"></a>
  <a href="https://github.com/navify/cli/releases/latest"><img src="https://img.shields.io/github/release/navify/cli/all.svg?colorB=97CA00&label=latest%20version"></a>
  <a href="https://github.com/navify/cli/releases"><img src="https://img.shields.io/github/downloads/navify/cli/total.svg?colorB=97CA00&label=total%20downloads"></a>
  <a href="https://discord.gg/VnevqPp2Rr"><img src="https://img.shields.io/discord/842219447716151306?label=chat&logo=discord&logoColor=discord"></a>
</p>

---

Command-line tool to customize the official Spotify client.
Supports Windows, MacOS and Linux.

<img src=".github/assets/logo.png" alt="Navify logo" align="right" width="360">

### Installation

#### Windows

Double-click `install.bat`, or run it from Command Prompt:

```bat
install.bat
```

You can also run the PowerShell installer directly:

```powershell
iwr -useb https://raw.githubusercontent.com/navify/cli/main/install.ps1 | iex
```

#### macOS and Linux

Run:

```sh
curl -fsSL https://raw.githubusercontent.com/navify/cli/main/install.sh | sh
```

#### Build from source

Requires Go and pnpm.

```sh
git clone https://github.com/navify/cli.git
cd cli
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
$HOME/.config/navify/Themes/YourTheme
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
