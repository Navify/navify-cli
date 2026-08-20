#!/usr/bin/env sh

set -eu

override_root=0
tag=""
for arg in "$@"; do
    case "$arg" in
        --root) override_root=1 ;;
        -*) echo "Invalid option $arg" >&2; exit 1 ;;
        *) tag=$arg ;;
    esac
done

if [ "$(id -u)" -eq 0 ] && [ "$override_root" -eq 0 ]; then
    echo "Do not run this installer with sudo or as root." >&2
    echo "Pass --root only when a root-owned installation is intentional." >&2
    exit 1
fi

case "$(uname -s)-$(uname -m)" in
    Linux-x86_64|Linux-amd64) target="linux-amd64" ;;
    Linux-aarch64|Linux-arm64) target="linux-arm64" ;;
    Darwin-x86_64|Darwin-amd64) target="darwin-amd64" ;;
    Darwin-arm64|Darwin-aarch64) target="darwin-arm64" ;;
    *) echo "Unsupported platform $(uname -s) $(uname -m)." >&2; exit 1 ;;
esac

command -v curl >/dev/null 2>&1 || { echo "curl is required" >&2; exit 1; }
command -v tar >/dev/null 2>&1 || { echo "tar is required" >&2; exit 1; }
command -v sed >/dev/null 2>&1 || { echo "sed is required" >&2; exit 1; }

navify_install="$HOME/.navify"
exe="$navify_install/navify"
archive="$navify_install/navify.tar.gz"
log_file="$navify_install/install.log"
mkdir -p "$navify_install"
: > "$log_file"

cleanup() {
    rm -f "$archive"
}
trap cleanup EXIT HUP INT TERM

log() {
    echo "$1"
    echo "[$(date +'%H:%M:%S %Y-%m-%d')] $1" >> "$log_file"
}

if [ -z "$tag" ]; then
    tag=$(curl --fail --silent --show-error --location "https://api.github.com/repos/Navify/navify-cli/releases/latest" | sed -n 's/.*"tag_name"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' | head -n 1)
fi
tag=${tag#v}
if [ -z "$tag" ]; then
    log "Could not determine the latest Navify version."
    exit 1
fi

download_uri="https://github.com/Navify/navify-cli/releases/download/v$tag/navify-$tag-$target.tar.gz"
log "Downloading Navify v$tag for $target"
curl --fail --location --progress-bar --output "$archive" "$download_uri"

tar -tzf "$archive" >/dev/null
log "Installing Navify to $navify_install"
tar -xzf "$archive" -C "$navify_install"
if [ ! -f "$exe" ]; then
    log "The downloaded archive did not contain the navify executable."
    exit 1
fi
chmod +x "$exe"

add_to_profile() {
    shellrc=$1
    path_line=$2
    shellrc_dir=${shellrc%/*}
    mkdir -p "$shellrc_dir"
    touch "$shellrc"
    if ! grep -Fq "$navify_install" "$shellrc"; then
        printf '\n%s\n' "$path_line" >> "$shellrc"
        log "Added $navify_install to PATH in $shellrc"
    fi
}

case "${SHELL:-}" in
    *zsh) add_to_profile "${ZDOTDIR:-$HOME}/.zshrc" "export PATH=\"$navify_install:\$PATH\"" ;;
    *fish) add_to_profile "$HOME/.config/fish/config.fish" "fish_add_path \"$navify_install\"" ;;
    *) add_to_profile "$HOME/.bashrc" "export PATH=\"$navify_install:\$PATH\"" ;;
esac
export PATH="$navify_install:$PATH"

log "Navify v$tag was installed successfully."
log "Run 'navify --help' to get started."

choice=${NAVIFY_INSTALL_MARKETPLACE:-}
if [ -z "$choice" ] && [ -r /dev/tty ]; then
    printf 'Install Navify Marketplace? [Y/n] '
    read -r choice < /dev/tty || choice=""
fi
case "$choice" in
    n|N|no|NO|false|0) log "Marketplace installation skipped." ;;
    *)
        log "Installing Navify Marketplace."
        curl --fail --silent --show-error --location "https://raw.githubusercontent.com/Navify/navify-marketplace/main/resources/install.sh" | sh
        ;;
esac