<!-- markdownlint-disable MD024 -->

# Changelog

## v2.0.0 - 2026-11-14

### 🔧 Changed

- Upgraded Angular peer dependency range to `v14.2.0` - `v22.x`.

### 🐛 Fixed

- Now the numpad enter key works as `Enter` as well.
- Keys handled by a strategy now always call `preventDefault()`, even when repeated quickly. This stops the page from scrolling while holding keys like `ArrowDown` or `PageDown`.
- `manageKeyDown()` no longer reacts to key events with `Alt` or `Meta` pressed, or during IME composition. Those events are now left untouched, so browser and OS shortcuts like `(Alt / Cmd) + ArrowLeft` keep working.

## v1.0.1 - 2026-07-16

### 🐛 Fixed

- Fixed `menubar` keys for vertical orientation.

## v1.0.0 - 2026-05-20

### 🚀 Added

- Initial release of the library.
