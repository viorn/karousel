#!/usr/bin/env bash
# uninstall.sh — remove Karousel from the Plasma package directory.
#
#   ./uninstall.sh                     remove the package and disable it in kwinrc
#   ./uninstall.sh --forget-shortcuts  also drop the karousel-* shortcuts (config is backed up)
#
# The package directory and the keybindings are left alone unless asked for; use
# `karousel-toolbox restore` to roll kwinrc/kglobalshortcutsrc back to a backup.
# Changes apply after a re-login (see install.sh for why not through D-Bus).

set -euo pipefail

SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
cd "$SCRIPT_DIR"

CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}"
DATA_DIR="${XDG_DATA_HOME:-$HOME/.local/share}"
KWINRC="$CONFIG_DIR/kwinrc"
GSA="$CONFIG_DIR/kglobalshortcutsrc"

FORGET_SHORTCUTS=0

usage() {
    cat <<'USAGE'
usage: ./uninstall.sh [--forget-shortcuts]

  --forget-shortcuts   also remove the karousel-* entries from kglobalshortcutsrc
USAGE
}

while [ $# -gt 0 ]; do
    case "$1" in
    --forget-shortcuts) FORGET_SHORTCUTS=1 ;;
    -h|--help) usage; exit 0 ;;
    *) echo "uninstall.sh: unknown option $1" >&2; usage >&2; exit 2 ;;
    esac
    shift
done

info() { printf '==> %s\n' "$*"; }
ok() { printf 'ok  %s\n' "$*"; }
die() { printf 'error: %s\n' "$*" >&2; exit 1; }

PLUGIN_ID=$(sed -n 's/.*"Id": *"\([^"]*\)".*/\1/p' package/metadata.json | head -1)

info "removing $PLUGIN_ID"
if kpackagetool6 --type=KWin/Script --remove "$PLUGIN_ID" 2>/dev/null; then
    ok "removed from $DATA_DIR/kwin/scripts/$PLUGIN_ID"
else
    ok "not installed, nothing to remove"
fi

info "disabling in kwinrc"
if command -v kwriteconfig6 >/dev/null; then
    kwriteconfig6 --file "$KWINRC" --group Plugins --key "${PLUGIN_ID}Enabled" false
elif command -v kwriteconfig5 >/dev/null; then
    kwriteconfig5 --file "$KWINRC" --group Plugins --key "${PLUGIN_ID}Enabled" false
else
    printf 'warning: kwriteconfig6 not found, set %sEnabled=false in [Plugins] of %s manually\n' "$PLUGIN_ID" "$KWINRC" >&2
fi
ok "disabled"

if [ "$FORGET_SHORTCUTS" = 1 ] && [ -f "$GSA" ]; then
    info "forgetting the shortcuts"
    BACKUP_DIR="$DATA_DIR/karousel-toolbox/backups/$(date +%Y%m%d-%H%M%S)-uninstall"
    mkdir -p "$BACKUP_DIR"
    cp "$GSA" "$BACKUP_DIR/kglobalshortcutsrc"
    sed -i "/^karousel-/d" "$GSA"
    ok "karousel-* removed from kglobalshortcutsrc (backup: $BACKUP_DIR)"
elif [ "$FORGET_SHORTCUTS" = 1 ]; then
    ok "no kglobalshortcutsrc, nothing to forget"
fi

cat <<EOF

Done. Log out and back in (or restart KWin) to apply the changes.

The keybindings${FORGET_SHORTCUTS:+ other than the forgotten ones} are kept in
$GSA, and the plugin's settings stay in [Script-$PLUGIN_ID] of kwinrc, so
re-installing restores the previous setup.
EOF
