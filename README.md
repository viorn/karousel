# Karousel
Scrollable tiling Kwin script. Works especially well with ultrawide screens.
Use with [this](https://github.com/peterfajdiga/kwin4_effect_geometry_change) for animations.

https://github.com/peterfajdiga/karousel/assets/22796326/2ab62d18-09c7-45f9-8fda-e5e36b8d7a02

A scrollable tiling window manager tiles windows, but it does not maximize their widths. Instead, it leaves the width of windows to the user's control.
Windows are automatically centered when possible. And when running out of width, windows can be scrolled through horizontally.

Similar window managers include [PaperWM](https://github.com/paperwm/PaperWM),
[Niri](https://github.com/YaLTeR/niri), and
[Cardboard](https://gitlab.com/cardboardwm/cardboard).

## Dependencies
Karousel requires the following QML modules:
- QtQuick 6.0
- org.kde.kwin 3.0
- org.kde.notification 1.0

## Limitations
- Doesn't support multiple screens
- Doesn't support windows on all desktops
- Doesn't support windows on multiple activities

## Installation
First install the _org.kde.notification_ QML module (_qml-module-org-kde-notifications_ package on Ubuntu).

Then download the [latest release](https://github.com/peterfajdiga/karousel/releases/latest) and extract it into _~/.local/share/kwin/scripts/_.

Or clone the repo and run `make install` (requires npm, node, and tsc).

## Key bindings
The key bindings can be configured in KDE System Settings among KWin's own keyboard shortcuts.
Here's the default ones:
| Shortcut                 | Action                                                                                                                         |
| ---                      | ---                                                                                                                            |
| Meta+Space               | Toggle floating                                                                                                                |
| Meta+A                   | Move focus left                                                                                                                |
| Meta+D                   | Move focus right (Clashes with default KDE shortcuts, may require manual remapping)                                            |
| Meta+W                   | Move focus up (Clashes with default KDE shortcuts, may require manual remapping)                                               |
| Meta+S                   | Move focus down (Clashes with default KDE shortcuts, may require manual remapping)                                             |
| (unassigned)             | Move focus to the next window in grid                                                                                          |
| (unassigned)             | Move focus to the previous window in grid                                                                                      |
| Meta+Home                | Move focus to start                                                                                                            |
| Meta+End                 | Move focus to end                                                                                                              |
| Meta+Shift+A             | Move window left (Moves window out of and into columns)                                                                        |
| Meta+Shift+D             | Move window right (Moves window out of and into columns)                                                                       |
| Meta+Shift+W             | Move window up                                                                                                                 |
| Meta+Shift+S             | Move window down                                                                                                               |
| (unassigned)             | Move window to the next position in grid                                                                                       |
| (unassigned)             | Move window to the previous position in grid                                                                                   |
| Meta+Shift+Home          | Move window to start                                                                                                           |
| Meta+Shift+End           | Move window to end                                                                                                             |
| (unassigned)             | Increase window height upwards                                                                                                 |
| (unassigned)             | Increase window height downwards                                                                                               |
| Meta+X                   | Toggle stacked layout for focused column (Only the active window visible)                                                      |
| Meta+Ctrl+Shift+A        | Move column left                                                                                                               |
| Meta+Ctrl+Shift+D        | Move column right                                                                                                              |
| Meta+Ctrl+Shift+Home     | Move column to start                                                                                                           |
| Meta+Ctrl+Shift+End      | Move column to end                                                                                                             |
| (unassigned)             | Move column to the next desktop                                                                                                |
| (unassigned)             | Move column to the previous desktop                                                                                            |
| Meta+Ctrl++              | Increase column width                                                                                                          |
| Meta+Ctrl+-              | Decrease column width                                                                                                          |
| (unassigned)             | Increase column width to maximum                                                                                               |
| (unassigned)             | Decrease column width to minimum                                                                                               |
| Meta+R                   | Cycle through preset column widths                                                                                             |
| Meta+Shift+R             | Cycle through preset column widths in reverse                                                                                  |
| Meta+Ctrl+X              | Equalize widths of visible columns                                                                                             |
| Meta+Ctrl+A              | Squeeze left column onto the screen (Clashes with default KDE shortcuts, may require manual remapping)                         |
| Meta+Ctrl+D              | Squeeze right column onto the screen                                                                                           |
| Meta+Alt+Return          | Center focused window (Scrolls so that the focused window is centered in the screen)                                           |
| Meta+Alt+A               | Scroll one column to the left                                                                                                  |
| Meta+Alt+D               | Scroll one column to the right                                                                                                 |
| Meta+Alt+PgUp            | Scroll left                                                                                                                    |
| Meta+Alt+PgDown          | Scroll right                                                                                                                   |
| Meta+Alt+Home            | Scroll to start                                                                                                                |
| Meta+Alt+End             | Scroll to end                                                                                                                  |
| Meta+Ctrl+Return         | Move Karousel grid to the current screen                                                                                       |
| (unassigned)             | Move this and all following columns to the next desktop                                                                        |
| (unassigned)             | Move this and all following columns to the previous desktop                                                                    |
| Meta+[N]                 | Move focus to column N (Clashes with default KDE shortcuts, may require manual remapping)                                      |
| Meta+Shift+[N]           | Move window to column N (Requires manual remapping according to your keyboard layout, e.g. Meta+Shift+1 -> Meta+!)             |
| Meta+Ctrl+Shift+[N]      | Move column to position N (Requires manual remapping according to your keyboard layout, e.g. Meta+Ctrl+Shift+1 -> Meta+Ctrl+!) |
| Meta+Ctrl+Shift+F[N]     | Move column to desktop N                                                                                                       |
| Meta+Ctrl+Shift+Alt+F[N] | Move this and all following columns to desktop N                                                                               |

## Changes in this fork

Personal fork of [peterfajdiga/karousel](https://github.com/peterfajdiga/karousel).
Upstream is kept as the `upstream` remote, this fork is `origin`.

### KDE-safe default shortcuts

Several upstream defaults collide with stock Plasma 6 shortcuts, and since an
existing KDE binding always wins, those actions silently end up with no key at
all (`focus-right`/`focus-up`/`focus-down`, `focus-1..9`, `cycle-preset-widths`,
`cycle-preset-widths-reverse`). This fork moves them to a vim-style set that is
free on a stock KDE setup, without touching any KDE default:

| Action                        | Upstream                 | This fork                |
| ----------------------------- | ------------------------ | ------------------------ |
| `focus-left`                  | `Meta+A`                 | `Meta+Ctrl+H`            |
| `focus-down`                  | `Meta+S`                 | `Meta+Ctrl+J`            |
| `focus-up`                    | `Meta+W`                 | `Meta+Ctrl+K`            |
| `focus-right`                 | `Meta+D`                 | `Meta+Ctrl+L`            |
| `focus-N` (N = 1..9)          | `Meta+N`                 | `Meta+Ctrl+N`            |
| `cycle-preset-widths`         | `Meta+R`                 | `Meta+Ctrl+W`            |
| `cycle-preset-widths-reverse` | `Meta+Shift+R`           | `Meta+Ctrl+Shift+W`      |

`column-width-increase`/`decrease` keep `Meta+Ctrl++` / `Meta+Ctrl+-` — note
that `+` requires Shift on most layouts, so on a regular keyboard only the
numpad `+` and `cycle-preset-widths` are practical ways to widen a column.

### Focus follows the window in view (touchpad gestures)

Upstream only re-focuses after a gesture if the focused window is not visible at
all, so after scrolling to a window in the middle of the screen the focus stayed
on a window which was barely visible. Leaving the desktop and coming back then
restored that stale focus, which also dragged the scroll position back to it.

With `gestureScrollFocus` (enabled by default, `Touchpad scrolling` section of
the settings) a finished gesture focuses the visible window whose center is the
closest to the center of the screen — no need for the window to be entirely in
view, a wide window which is only partially visible still wins over a narrow one
at the edge. On a tie the already focused window stays, so the focus doesn't
flicker between two equally distant windows. The window is then scrolled entirely
into view, exactly as if it had been clicked — even when it was already focused,
which is the common case and used to leave it partially off-screen. Gestures
which don't scroll don't touch the focus.

### Minimum window height is respected
Upstream splits a column evenly without looking at the clients' minimum heights
(`// TODO: respect min height` in `src/lib/layout/Column.ts`), so a window with
a large minimum (system settings, some GTK apps) would stick while being resized
and could overflow the bottom of the tiling area. This fork:

- clamps the divider between two windows in a column, so resizing stops when
  either of them reaches its minimum instead of the neighbor being pushed below
  it (`Column.adjustWindowHeight`),
- hands the window with a large minimum its minimum height when a column is
  rearranged, and splits the rest evenly among the other windows
  (`Column.distributeHeights`),
- shrinks the windows proportionally when the minimums of all windows in a
  column don't fit into the tiling area at all, instead of overflowing it.

With no minimum heights declared (the usual case) the layout is identical to
upstream.

> **Reloading the script breaks touchpad gestures.** KWin 6.3's `SwipeGestureHandler`
> has an empty destructor and never unregisters its gesture, so after
> `unloadScript` + `loadDeclarativeScript` the gesture registry is left with a
> dangling pointer and swipes stop working until KWin restarts. Install changes
> take effect after a re-login, not after a D-Bus reload (`karousel-toolbox`
> prints a warning about it).

### Install

```bash
make install            # build (lint + tests + tsc) and install into ~/.local/share/kwin/scripts
karousel-toolbox ...    # optional: wrapper used to manage install/uninstall/backups
```
