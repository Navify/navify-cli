package cmd

import (
	"bytes"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

func SpotifyKill() {
	switch runtime.GOOS {
	case "windows":
		isRunning := exec.Command("tasklist", "/FI", "ImageName eq spotify.exe")
		result, _ := isRunning.Output()
		if !bytes.Contains(result, []byte("No tasks are running")) {
			exec.Command("taskkill", "/F", "/IM", "spotify.exe").Run()
		}
	case "linux":
		isRunning := exec.Command("pgrep", "-x", "spotify")
		_, err := isRunning.Output()
		if err == nil {
			exec.Command("pkill", "-x", "spotify").Run()
		} else {
			exec.Command("pkill", "-f", "spotify").Run()
		}
	case "darwin":
		isRunning := exec.Command("pgrep", "-x", "Spotify")
		_, err := isRunning.Output()
		if err == nil {
			exec.Command("pkill", "-x", "Spotify").Run()
		}
	}
}

func SpotifyStart(flags ...string) {
	enableDevtools := settingSection.Key("always_enable_devtools").MustBool(false)
	if enableDevtools {
		EnableDevTools()
	}

	launchFlag := settingSection.Key("spotify_launch_flags").Strings("|")
	if len(launchFlag) > 0 {
		flags = append(flags, launchFlag...)
	}

	switch runtime.GOOS {
	case "windows":
		if isAppX {
			ps, _ := exec.LookPath("powershell.exe")
			exe := filepath.Join(os.Getenv("LOCALAPPDATA"), "Microsoft", "WindowsApps", "Spotify.exe")
			cmd := `& "` + exe + `" --app-directory="` + appDestPath + `"`
			if len(flags) > 0 {
				cmd += " " + strings.Join(flags, " ")
			}
			exec.Command(ps, "-NoProfile", "-NonInteractive", "-Command", cmd).Start()
		} else {
			exec.Command(filepath.Join(spotifyPath, "spotify.exe"), flags...).Start()
		}
	case "linux":
		spotifyBin := filepath.Join(spotifyPath, "spotify")
		if strings.Contains(spotifyPath, "flatpak") {
			args := append([]string{"run", "com.spotify.Client"}, flags...)
			if err := exec.Command("flatpak", args...).Start(); err == nil {
				return
			}
		}
		if strings.Contains(spotifyPath, "/snap/") {
			args := append([]string{"run", "spotify"}, flags...)
			if err := exec.Command("snap", args...).Start(); err == nil {
				return
			}
		}
		exec.Command(spotifyBin, flags...).Start()
	case "darwin":
		appPath := filepath.Clean(filepath.Join(spotifyPath, "..", ".."))
		if filepath.Base(appPath) != "Spotify.app" {
			appPath = "/Applications/Spotify.app"
		}
		flags = append([]string{"-a", appPath, "--args"}, flags...)
		exec.Command("open", flags...).Start()
	}
}

func SpotifyRestart(flags ...string) {
	SpotifyKill()
	SpotifyStart(flags...)
}
