<!-- markdownlint-disable MD024 -->

# Changelog

## v1.2.2 - 2026-05-18

### 🚀 Added

- [`keepInViewport`](./README.md#the-keep-in-viewport): Determines whether the overlay should remain visible within the viewport when scrolling.

## v1.1.1 - 2026-02-13

### 🚀 Added

- [`initialScale`](./README.md#the-initial-scale): Indicates the scale factor of the overlay for the very first time it calculates its size.
- [`alignmentOrder`](./README.md#the-alignment-order): Establishes the alignment order priority for when repositioning is needed.

### 🔧 Changed

- [`boundary`](./README.md#the-custom-boundary): Now accepts a string selector.
- [`maxSize`](./README.md#the-fluid-size-on-or-off) (within [`OverlayBaseCalculatedPosition` object](./README.md#the-calculated-position)): Now returns both `width` & `height` (when `fluidSize` is set to `true`) or `undefined` otherwise.

## v1.0.0 - 2025-09-23

### 🚀 Added

- Initial release of the library.
