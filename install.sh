#!/usr/bin/env bash
# install.sh — build and install Karousel into ~/.local/share/kwin/scripts.
#
#   ./install.sh              build (lint + tests + tsc) and install
#   ./install.sh --no-build   install ./package as is (needs package/contents/code/main.js)
#   ./install.sh --toolbox     also install bin/karousel-toolbox into ~/.local/bin
#
# The script is installed into the Plasma package directory with kpackagetool6 and
# enabled in kwinrc; it never talks to a running KWin, because unloading a script
# from a live session leaves a dangling gesture registration in KWin 6.3 and kills
# touchpad gestures. Changes apply after a re-login.

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR"

CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
KWINRC="$CONFIG_DIR/kwinrc"

BUILD=1
WITH_TOOLBOX=0

usage() {
    cat <<'USAGE'
usage: ./install.sh [--no-build] [--toolbox]

  --no-build   install ./package as is (needs package/contents/code/main.js)
  --toolbox    also install bin/karousel-toolbox into ~/.local/bin
USAGE
}

while [ $# -gt 0 ]; do
    case "$1" in
    --no-build) BUILD=0 ;;
    --toolbox) WITH_TOOLBOX=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "install.sh: unknown option $1" >&2; usage >&2; exit 2 ;;
    esac
    shift
done

info() { printf '==> %s\n' "$*"; }
ok() { printf 'ok  %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

[ -f package/metadata.json ] || die "package/metadata.json not found, run this from the repository root"

PLUGIN_ID=$(sed -n 's/.*"Id": *"\([^"]*\)".*/\1/p' package/metadata.json | head -1)
VERSION=$(sed -n 's/.*"Version": *"\([^"]*\)".*/\1/p' package/metadata.json | head -1)
MAIN_JS="package/contents/code/main.js"

command -v kpackagetool6 >/dev/null || die "kpackagetool6 not found (package: plasma-framework / plasma-desktop)"

if [ "$BUILD" = 1 ]; then
    info "building (lint + tests + tsc)"
    command -v pnpm >/dev/null || die "pnpm not found. Install it, or use --no-build with a prebuilt $MAIN_JS"
    make build
else
    [ -f "$MAIN_JS" ] || die "$MAIN_JS is missing. Drop --no-build to build it, or take it from a release tarball"
fi

info "installing $PLUGIN_ID $VERSION"
if ! kpackagetool6 --type=KWin/Script --install="./package" 2>/dev/null; then
    kpackagetool6 --type=KWin/Script --upgrade="./package"
fi
ok "installed into $DATA_DIR/kwin/scripts/$PLUGIN_ID"

info "enabling in kwinrc"
mkdir -p "$CONFIG_DIR"
if command -v kwriteconfig6 >/dev/null; then
    kwriteconfig6 --file "$KWINRC" --group Plugins --key "${PLUGIN_ID}Enabled" true
elif command -v kwriteconfig5 >/dev/null; then
    kwriteconfig5 --file "$KWINRC" --group Plugins --key "${PLUGIN_ID}Enabled" true
else
    die "kwriteconfig6 not found (package: kconfig); set ${PLUGIN_ID}Enabled=true in [Plugins] of $KWINRC manually"
fi
ok "enabled"

if [ "$WITH_TOOLBOX" = 1 ]; then
    info "installing karousel-toolbox"
    install -Dm755 ./bin/karousel-toolbox "$HOME/.local/bin/karousel-toolbox"
    ok "$HOME/.local/bin/karousel-toolbox"
fi

cat <<EOF

Done. Log out and back in (or restart KWin) to apply the changes.

Do not reload the script through D-Bus in a live session: KWin 6.3 never
unregisters SwipeGestureHandler, so touchpad scrolling stops working until the
compositor restarts.

Settings:   systemsettings kcm_kwin_scripts  ->  Karousel
Shortcuts:  systemsettings kcm_keys          ->  Karousel
Toolbox:    make toolbox   (or ./install.sh --toolbox) for uninstall/backups/status
EOF
