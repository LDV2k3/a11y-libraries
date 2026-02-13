# Overlay

- An Angular directive and component to show any content within a floating overlay-style element, seamlessly positioned relative to its trigger.
- The overlay automatically repositions itself on scroll or window resize to remain fully visible within the viewport or its boundary.

The main goal of this library is to prevent any common accessibility pitfalls, like _losing_ the opened element within containers with overflow, not being automatically repositioned on scroll or window resize (specially for keyboard users), etc.

![Angular support from version 12 up to version 20](https://img.shields.io/badge/Angular-v12_to_v20-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v20.

## Index

- [Installation](#installation)
- [The Configuration Object](#the-configuration-object)
  - [Configuration of the Module](#configuration-of-the-module)
    - [The `rootConfig()` method](#the-rootconfig-method)
    - [The `customConfig()` method](#the-customconfig-method)
  - [The Overlay Config](#the-overlay-config)
    - [The Base Config](#the-base-config)
    - [The Behavior Config](#the-behavior-config)
    - [The Styles Config](#the-styles-config)
    - [The Color Scheme Config](#the-color-scheme-config)
    - [The Overlay Internal Config](#the-overlay-internal-config)
      - [The Trigger Element](#the-trigger-element)
      - [The Position Input](#the-position-input)
        - [The Positions Allowed Input](#the-positions-allowed-input)
        - [The Alignments Allowed Input](#the-alignments-allowed-input)
      - [The Position Strategy](#the-position-strategy)
      - [The Custom Boundary](#the-custom-boundary)
      - [The Safe Space](#the-safe-space)
        - [The Safe Space Off](#the-safe-space-off)
        - [The Safe Space On](#the-safe-space-on)
        - [The Safe Space and zIndex Issues](#the-safe-space-and-zindex-issues)
      - [The Fluid Alignment](#the-fluid-alignment)
        - [The Fluid Alignment On or Off](#the-fluid-alignment-on-or-off)
      - [The Fluid Size](#the-fluid-size)
        - [The Fluid Size On or Off](#the-fluid-size-on-or-off)
      - [The Viewport Size](#the-viewport-size)
      - [The Viewport Safe Size](#the-viewport-safe-size)
        - [The Viewport Safe Size Without a Boundary](#the-viewport-safe-size-without-a-boundary)
        - [The Viewport Safe Size With a Boundary](#the-viewport-safe-size-with-a-boundary)
    - [The Overlay Custom Config](#the-overlay-custom-config)
      - [The Selector](#the-selector)
      - [The Arrow Size](#the-arrow-size)
      - [The Offset Size](#the-offset-size)
      - [The Fade Timeout](#the-fade-timeout)
      - [The Fade Delay Timeout](#the-fade-delay-timeout)
      - [The zIndex](#the-zindex)
      - [The Padding](#the-padding)
      - [The Shadow](#the-shadow)
      - [The Background Color](#the-background-color)
      - [The Text Color](#the-text-color)
      - [The Border Size](#the-border-size)
      - [The Border Color](#the-border-color)
      - [The Border Radius](#the-border-radius)
      - [The Max Width](#the-max-width)
      - [The Max Height](#the-max-height)
      - [The Class Names](#the-class-names)
  - [The Types](#the-types)
    - [The Overlay Position](#the-overlay-position)
      - [The Overlay Reposition](#the-overlay-reposition)
        - [The Overlay Reposition by Square Areas](#the-overlay-reposition-by-square-areas)
    - [The Overlay Alignment](#the-overlay-alignment)
      - [The Overlay Alignment Horizontally](#the-overlay-alignment-horizontally)
      - [The Overlay Alignment Vertically](#the-overlay-alignment-vertically)
      - [The Overlay Realignment](#the-overlay-realignment)
- [The Directive or the Component?](#the-directive-or-the-component)
- [The Overlay Directive](#the-overlay-directive)
  - [The Directive Inputs](#the-directive-inputs)
    - [The Config Input](#the-config-input)
      - [The Config Input Examples](#the-config-input-examples)
        - [The Config Input through an Object](#the-config-input-through-an-object)
        - [The Config Input through a String](#the-config-input-through-a-string)
        - [The Config Input through the `OverlayCreateService`](#the-config-input-through-the-overlaycreateservice)
  - [The Directive Outputs](#the-directive-outputs)
  - [The Directive public Methods, Properties, Getters and Setters](#the-directive-public-methods-properties-getters-and-setters)
    - [The Directive `setOverlayConfig()` Method](#the-directive-setoverlayconfig-method)
    - [The Directive `setStyles()` Method](#the-directive-setstyles-method)
    - [The Directive `setCustomSelector()` Method](#the-directive-setcustomselector-method)
    - [The Directive `show()` Method](#the-directive-show-method)
    - [The Directive `hide()` Method](#the-directive-hide-method)
    - [The Directive `toggle()` Method](#the-directive-toggle-method)
  - [The Directive Listeners](#the-directive-listeners)
    - [The Directive Close Listeners](#the-directive-close-listeners)
      - [The Directive Close on Escape Listener](#the-directive-close-on-escape-listener)
      - [The Directive Close on Click Outside Listener](#the-directive-close-on-click-outside-listener)
    - [The Directive Tab Cycle Listener](#the-directive-tab-cycle-listener)
      - [The Directive Focus on Overlay First](#the-directive-focus-on-overlay-first)
- [The Overlay Component](#the-overlay-component)
- [The Overlay Arrow Component](#the-overlay-arrow-component)
  - [The Arrow Component inside the Directive](#the-arrow-component-inside-the-directive)
- [The Overlay Create Service](#the-overlay-create-service)
  - [The Service Create Method](#the-service-create-method)
    - [The Service Create Method using an `HTMLElement` trigger](#the-service-create-method-using-an-htmlelement-trigger)
    - [The Service Create Method using a `DOMRect` trigger](#the-service-create-method-using-a-domrect-trigger)
  - [The Service Destroy Method](#the-service-destroy-method)
- [The Color Schemes](#the-color-schemes)
  - [How to Configure the Color Schemes](#how-to-configure-the-color-schemes)
  - [How to Force a Scheme](#how-to-force-a-scheme)
  - [How to add a New Color Scheme](#how-to-add-a-new-color-scheme)
- [Examples](#examples)
  - [The Component Use](#the-component-use)
  - [The Directive Use](#the-directive-use)
  - [The Responsive Table](#the-responsive-table)
  - [The Context Menu](#the-context-menu)

## Installation

1. Install npm package:

   `npm install @a11y-ngx/overlay --save`

2. Import `A11yOverlayModule` into your module or standalone component:

```typescript
import { A11yOverlayModule } from '@a11y-ngx/overlay';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yOverlayModule,
    ],
})
export class AppModule { }
```

> **CHECK ALSO:** The [rootConfig()](#the-rootconfig-method) and [customConfig()](#the-customconfig-method) methods.

## The Configuration Object

[Check the Types](#the-types) to better understand each property.

### Configuration of the Module

The module can be configured at a:

- **Root Level**: <br />
  Using [the `rootConfig()` method](#the-rootconfig-method) and providing a config object of type [`OverlayRootConfig`](#the-overlay-config).
- **Custom Level**:  <br />
  Using [the `customConfig()` method](#the-customconfig-method) and providing a config object of type [`OverlayCustomConfig`](#the-overlay-custom-config).

#### The `rootConfig()` method

Serves to establish and override the global default configuration.

> ⚠️ **IMPORTANT:**
>
> ❗❗ **DO NOT use it on a library or a low level component within your app**, since this method is meant to be called only once, the idea is to use it at a root level on the main app.
>
> On a library or sub-module, you can use [the `customConfig()` method](#the-customconfig-method).

Accepts a single parameter `config` of type [`OverlayRootConfig`](#the-overlay-config).

**On Angular v12 - v14:**

```typescript
A11yOverlayModule.rootConfig({
    arrowSize: 5,
    offsetSize: 10,
    safeSpace: { top: 65, left: 50 },
}),
```

**On Angular v15+:**

```typescript
provideA11yOverlay({
    arrowSize: 5,
    offsetSize: 10,
    safeSpace: { top: 65, left: 50 },
}),
```

#### The `customConfig()` method

Serves to establish a sub level configuration based on a given `selector`.

> **IMPORTANT:** Everything established within a `customConfig()` it's going to _look back_ for missing properties. Meaning that, if you only set (as the example below) only 2 values, the rest will be filled out checking the globals (set in the `rootConfig()`, if any) and then the defaults.

Accepts a single parameter `config` of type [`OverlayCustomConfig`](#the-overlay-custom-config).

**On Angular v12 - v14:**

```typescript
A11yOverlayModule.customConfig({
    selector: 'my-custom-component',
    arrowSize: 0,
    positionStrategy: 'absolute',
}),
```

**On Angular v15+:**

```typescript
provideA11yOverlayFeature({
    selector: 'my-custom-component',
    arrowSize: 0,
    positionStrategy: 'absolute',
}),
```

> **Use case**:
>
> In the above example, by providing the selector `'my-custom-component'`, it will create a sub set of custom properties and styles for all overlays rendered inside that selector.
>
> In this particular case, those overlays will not have an arrow, while the rest (outside that selector) will have arrows of `5px`, since that was the value set in `rootConfig()`.

### The Overlay Config

`OverlayRootConfig` is a `Partial<>` of `OverlayConfig`.

It extends from 4 other types:

- The [Config Base Type](#the-base-config).
- The [Config Behavior Type](#the-behavior-config).
- The [Config Styles Type](#the-styles-config).
- The [Config Color Scheme Type](#the-color-scheme-config).

Some other config types:

- The [Internal Config Type](#the-overlay-internal-config).
- The [Custom Config Type](#the-overlay-custom-config).

#### The Base Config

- **Dependency:** [`Overlay Base abstract class`](https://www.npmjs.com/package/@a11y-ngx/overlay-base).
- **Type:** `OverlayBaseConfig`.
- **Properties:**

  | Property | Type | Description |
  | :------- | :--- | :---------- |
  | `position` | `OverlayPositionInput` | See [the Position Input](#the-position-input) |
  | `positionStrategy` | `OverlayPositionStrategy` | See [the Position Strategy](#the-position-strategy) |
  | `positionsAllowed` | `OverlayPositionsAllowedInput` | See [the Positions Allowed Input](#the-positions-allowed-input) |
  | `alignmentsAllowed` | `OverlayAlignmentsAllowedInput` | See [the Alignments Allowed Input](#the-alignments-allowed-input) |
  | `safeSpace` | `OverlaySafeSpace` | See [the Safe Space](#the-safe-space) |
  | `fluidAlignment` | `boolean` | See [the Fluid Alignment](#the-fluid-alignment) |
  | `fluidSize` | `boolean` | See [the Fluid Size](#the-fluid-size) |
  | `allowScrollListener` | `boolean` | See [the Page Scroll Listener](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-page-scroll-listener) (from the Base Class library) |

#### The Behavior Config

- **Type:** `OverlayConfigBehavior`.
- **Properties:**

  | Property | Type | Description |
  | :------- | :--- | :---------- |
  | `allowClose` | `OverlayAllowClose` or `boolean` | See [the Close Listeners](#the-directive-close-listeners) |
  | `allowTabCycle` | `boolean` | See [the Tab-Cycle Listener](#the-directive-tab-cycle-listener) |
  | `firstFocusOn` | `'first'` or `'last'` or `undefined` | See [the Tab-Cycle Focus First](#the-directive-focus-on-overlay-first) |

#### The Styles Config

All color related default values (★) are coming from the variables set within [the Color Scheme global configuration](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties).

- **Type:** `OverlayConfigStyles`.
- **Properties:**

  | Property | Type | Description |
  | :------- | :--- | :---------- |
  | `arrowSize` | `number` | See [the Arrow Size](#the-arrow-size) |
  | `offsetSize` | `number` | See [the Offset Size](#the-offset-size) |
  | `fadeMs` | `number` | See [the Fade Timeout](#the-fade-timeout) |
  | `fadeDelayMs` | `number` | See [the Fade Delay Timeout](#the-fade-delay-timeout) |
  | `zIndex` | `number` | See [the zIndex](#the-zindex) |
  | `padding` | `string` | See [the Padding](#the-padding) |
  | `shadow` ★ | `string` | See [the Shadow](#the-shadow) |
  | `shadowColor` ★ | `string` | See [the Shadow](#the-shadow) |
  | `backgroundColor` ★ | `string` | See [the Background Color](#the-background-color) |
  | `textColor` ★ | `string` | See [the Text Color](#the-text-color) |
  | `borderSize` | `number` | See [the Border Size](#the-border-size) |
  | `borderColor` ★ | `string` | See [the Border Color](#the-border-color) |
  | `borderRadius` | `number` | See [the Border Radius](#the-border-radius) |
  | `className` | `string` or `string[]` | See [the Class Names](#the-class-names) |
  | `maxWidth` | `string` | See [the Max Width](#the-max-width) |
  | `maxHeight` | `string` | See [the Max Height](#the-max-height) |

#### The Color Scheme Config

- **Dependency:** [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#the-color-scheme-config-styles-config).
- **Type:** `ColorSchemeStylesConfig`.
- **Properties:**

  | Property | Type | Description |
  | :------- | :--- | :---------- |
  | `colorSchemes` | `Object` | See [how to Configure the Color Schemes](#how-to-configure-the-color-schemes) |
  | `forceScheme` | `ColorScheme` | See [how to Force a Scheme](#how-to-force-a-scheme) |

#### The Overlay Internal Config

This type contains properties that are mostly being used inside [the Overlay Base Config Object](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-configuration-object).

- **Type:** `OverlayInternalConfig`.
- **Properties:**
  - [`trigger`](#the-trigger-element).
  - [`position`](#the-position-input).
  - [`positionStrategy`](#the-position-strategy).
  - [`boundary`](#the-custom-boundary).
  - [`safeSpace`](#the-safe-space).
  - [`offsetSize`](#the-offset-size).
  - [`fluidAlignment`](#the-fluid-alignment).
  - [`fluidSize`](#the-fluid-size).
  - [`positionsAllowed`](#the-positions-allowed-input).
  - [`alignmentsAllowed`](#the-alignments-allowed-input).
  - [`allowScrollListener`](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-page-scroll-listener) (from the Base Class library).

##### The Trigger Element

It is the _area_ from which the overlay will be relatively positioned.

- **Input / Config Property:** `trigger`.
- **Type:** `HTMLElement` or `DOMRect`.

When `HTMLElement` is provided (such as a `<button>`), it will be used as the _base_ element to calculate where to position the overlay.

When `DOMRect` is provided (such as a `PointerEvent`), those `x` and `y` coordinates are the _base_ to calculate where to position the overlay.

##### The Position Input

To input, in a simple way, either position or position & alignment (hyphen separated if `string` is used).

- **Input / Config Property:** `position`.
- **Type:** `OverlayPositionInput`.
- **From the Base library `enum`:** `POSITION` and `ALIGNMENT`.
- **Default:** `['top', 'center']`.
- **You can use:**
  - `OverlayPosition`: e.g.: `POSITION.BOTTOM`.
  - `[OverlayPosition, OverlayAlignment]`: e.g.: `[POSITION.RIGHT, ALIGNMENT.START]`.
  - `string`: e.g.: `'left'` or `'left-start'`.

See [the Overlay Position](#the-overlay-position) and [the Overlay Alignment](#the-overlay-alignment).

> **NOTE:** In case [alignmentsAllowed](#the-alignments-allowed-input) is set to `edges` and no alignment is provided here, `'start'` will be established as default.

###### The Positions Allowed Input

To establish which positions are allowed.

- **Input / Config Property:** `positionsAllowed`.
- **Type:** `OverlayPositionsAllowedInput`.
- **Default:** `'auto'`.
- **You can use:**
  - `'auto'`: means all sides are allowed.
  - `'opposite'`: means that the provided (or default) position and its opposite are only allowed. So if the overlay is set to the top, the allowed positions are `'top'` and `'bottom'`.
  - `string`: accepts a comma separated values, e.g.: `'top, right'`.
  - `OverlayPosition`: means that it will allow a single position, e.g.: `POSITION.RIGHT` or `'right'`.
    - ⚠️ **IMPORTANT:** avoid using this option unless you'll be 100% sure the overlay won't need repositioning!
  - `OverlayPosition[]`: an array of values, e.g.: `[POSITION.TOP, POSITION.RIGHT]` or `['top', 'right']`.

###### The Alignments Allowed Input

To establish which alignments are allowed.

- **Input / Config Property:** `alignmentsAllowed`.
- **Type:** `OverlayAlignmentsAllowedInput`.
- **Default:** `'auto'`.
- **You can use:**
  - `'auto'`: means all alignments are allowed.
  - `'center'`: means that only center alignment is allowed (and it will only work if [Fluid Alignment](#the-fluid-alignment) is set to `true`).
  - `'edges'`: means that only `start` and `end` alignments are allowed.
    - 📘 **NOTE:** if no alignment was provided, `start` will be set as default.
  - `OverlayAlignment`: means that it will allow a single alignment, e.g.: `ALIGNMENT.START` or `'start'`.
    - ⚠️ **IMPORTANT:** avoid using this option unless you'll be 100% sure the overlay will be within the visible area at that alignment!
  - `OverlayAlignment[]`: an array of values, e.g.: `[ALIGNMENT.CENTER, ALIGNMENT.END]` or `['center', 'end']`.

##### The Position Strategy

To establish whether a `fixed` or `absolute` strategy positioning is used in CSS.

- **Input / Config Property:** `positionStrategy`.
- **Type:** `OverlayPositionStrategy`.
- **From the Base library `enum`:** `POSITION_STRATEGY`.
- **Default:** `'fixed'`.
- **Values:**
  - `'fixed'`.
  - `'absolute'`.

The `absolute` strategy was designed mainly to be utilized inside containers with overflow (such as [responsive tables](#the-responsive-table)) and to avoid the overlay to be seen in case of scrolling and the trigger being visually hidden.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-boundary-fixed-absolute.jpg)

```typescript
A11yOverlayModule.rootConfig({
    positionStrategy: 'absolute',
}),
```

##### The Custom Boundary

A custom boundary can be interpreted as a wrapper/container, and the overlay will consider that boundary as the new limits for its positioning.

> **NOTE:** You can establish a `string` with the element's selector or an HTML element.

- **Input / Config Property:** `boundary`.
- **Type:** `string` or `HTMLElement`.
- **Default:** `<body>`.

```html
<div class="main-boundary" #myBoundary> <!-- The Boundary -->
    <!-- left side -->
    <button type="button"
        #overlayTriggerLeft
        (click)="overlayElementLeft.toggle()">
        My Button
    </button>
    <a11y-overlay
        #overlayElementLeft="a11yOverlay"
        [trigger]="overlayTriggerLeft"
        [boundary]="myBoundary"> <!-- We pass the boundary to the overlay -->
        My Big Tooltip
    </a11y-overlay>

    <!-- right side -->
    <button type="button"
        #overlayTriggerRight
        (click)="overlayElementRight.toggle()">
        My Button
    </button>
    <a11y-overlay
        #overlayElementRight="a11yOverlay"
        [trigger]="overlayTriggerRight">
        My Big Tooltip
    </a11y-overlay>
</div>
```

In the above example, the overlay at the left has the `[boundary]` set with the element `myBoundary` and the one at the right has not.

Now, considering that the default position/alignment is set to `top-center`, the one at the left it's contained by the boundary limits and will be repositioned at the bottom, and since is wider than the trigger and can't be centered, it will be aligned to the start.

The one at the right will ignore the boundary completely and, therefore, will be positioned at `top` and aligned to the `center`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-boundary-on.jpg)

The use of boundaries can be helpful when we have containers with overflow (such as [responsive tables](#the-responsive-table)).

> ⚠️ **IMPORTANT:** for the given example below, and because of the possibility of an overflow, the boundary should be styled with `position: relative;` and the overlays inside should use `positionStrategy="absolute"`. See [The Position Strategy](#the-position-strategy) and [the Responsive Table example](#the-responsive-table).
>
> ![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-boundary-fixed-absolute.jpg)

##### The Safe Space

To establish an extra safe space to the viewport's edges in case some fixed areas are present, such as headers, side menus or footers.

This way, the overlay will consider this area as the _edge limit_ and reposition itself if reached. Most useful use cases are related to scroll events.

- **Input / Config Property:** `safeSpace`.
- **Type:** `OverlaySafeSpace`:
  - `object` with each side as a property of type `number`.
- **Default:** `{ top: 0, bottom: 0, left: 0, right: 0 }`.

###### The Safe Space Off

In this scenario we can see two different overlays with the default position/alignment (`top-center`) when the safe space is not set at all.

Both overlays have enough space at the top and can be centered.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-off.jpg)

###### The Safe Space On

Let's say we have a header at the top (`65px`) and a left side menu (`50px`), both fixed to the page.

Now we set the safe space with the desired values for our fixed landmarks:

```typescript
A11yOverlayModule.rootConfig({
    safeSpace: { top: 65, left: 50 },
}),
```

> **NOTE:** For the next examples, we have forced the right overlay to ignore the safe space.

The overlay at the left doesn't have enough space to be centered anymore and it will analyze where can be aligned, which will result at `start`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-on-no-scroll.jpg)

Now we start scrolling down and, the moment the left overlay reaches the top safe space limit, it will need to check the best side to reposition itself, which will result at `bottom`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-on-scroll.jpg)

We keep scrolling down and we can see the right overlay not repositioning and overlapping the header. This can be **an issue** depending on what `z-index` your landmarks are set. See [the Safe Space and zIndex Issues](#the-safe-space-and-zindex-issues).

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-on-scroll-overlapping.jpg)

###### The Safe Space and zIndex Issues

The overlay `z-index` value is set to `9999` by default.

This means that if, for instance, your header is _also_ set to `z-index: 9999;`, it will lead to leave the trigger behind, but not the overlay.

> **NOTE:** For this particular scenario, lets change the header and the top safe space to `100px`.

So, while the overlay has not reached the viewport's top edge limit, we can still see it, but only a third of the trigger:

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-on-scroll-issue-01.jpg)

And if we keep scrolling down, now the overlay has repositioned to the `bottom`, is still over the header but it doesn't seem to be "visually" attached to any trigger.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-safe-space-on-scroll-issue-02.jpg)

To avoid this issue, we can globally set the `z-index` to a lower value than our landmarks by using [the `rootConfig()` method](#the-rootconfig-method).

##### The Fluid Alignment

To establish whether the overlay's alignment will stick to the edges of the viewport/boundary (if set to `true`) or make jumps between `start`, `center` or `end` (if set to `false`).

- **Input / Config Property:** `fluidAlignment`.
- **Type:** `boolean`.
- **Default:** `false`.

###### The Fluid Alignment On or Off

If `fluidAlignment` is on, and the overlay width (or height) exceeds both, the trigger's size and the free space to be centered, it will stick to the closest viewport/boundary edge. If not (is off), it will use one of the edges of the trigger to align itself (`start` or `end`).

In the next example, the overlay on the left is the only one that has `fluidAlignment` set to `true`, which means that it's going to be aligned to the left side of the viewport, while the one on the right should respect either `start`, `center` or `end` (in this case) of its trigger.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-fluid-alignment-on-off.jpg)

When this option is on, and the overlay is sticked to one of the sides (the left one in this case), as shown in the example above, you can access the property `overlayOutside` with the side that it is out, as its value (`'left'`).

##### The Fluid Size

To establish whether the overlay size will adjust to the free space (if set to `true`) or stay as its original size, with the possibility of being out of the visible area, if larger (if set to `false`).

- **Input / Config Property:** `fluidSize`.
- **Type:** `boolean`.
- **Default:** `true`.

The size adjustment will depend of the overlay's position:

- if `top` or `bottom`, the `height` of the overlay will be adjusted to the free space of any of those sides.
- if `left` or `right`, the `width` of the overlay will be adjusted to the free space of any of those sides.

###### The Fluid Size On or Off

If `fluidSize` is on, and the overlay is bigger than the chosen side free space, it will auto adapt its size. If not (is off), it will respect the original size and could be partially off screen.

In the next example, both overlays have the same `maxWidth` value of `300px`, but only the one on the left has `fluidSize` set to `true`. The `maxHeight` is not set, which will result on automatic calculation based on its content.

This means that the one on the left it's going to auto adapt its size to the maximum top space (`193px` of height, without the arrow/offset sizes into consideration), while the one on the right will be partially off the screen, since its max content makes it `262px` of height.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-fluid-size-on-off.jpg)

Check also [the square areas](#the-overlay-reposition-by-square-areas) to better understand how the free space is calculated in case the overlay size exceeds it.

##### The Viewport Size

The viewport size (without the scrollbars into consideration).

- **Type:** `ViewportSize`:
  - `object` with `width` and `height` as a property of type `number`.
- **Default:** viewport's width and height.

##### The Viewport Safe Size

The viewport safe size is the result of how many free space (`width` and `height`) the overlay can consider to be positioned.

It will be the calculation between the [viewport size](#the-viewport-size), a given [custom boundary](#the-custom-boundary) (also without the scrollbars into consideration, if any) and/or the [safe space](#the-safe-space).

- **Type:** `ViewportSize`.

In the following two examples, the green area is the so called _viewport **safe** size_, meaning that the overlay will consider only that area to establish its position and alignment.

###### The Viewport Safe Size Without a Boundary

Imagine having a viewport of `755px` of width and `415px` of height and two safe spaces, one at the `top` of `65px` and another at the `left` of `50px`.

In this case, the _safe size_ will be the result of:

- the viewport's `width` minus the `left` safe space: `755 - 50 = 705px`.
- the viewport's `height` minus the `top` safe space `415 - 65 = 350px`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-viewport-safe-size-without-boundary.jpg)

###### The Viewport Safe Size With a Boundary

Now imagine having the same viewport (`755px` by `415px`), the same safe spaces (`65px` and `50px`) and a [custom boundary](#the-custom-boundary) of `730px` of `width` and `240px` of `height`. This boundary is, in this examnple, by design, partially behind the left safe space.

The _safe size_ will be the result of the custom boundary size minus the safe space area that is overlapping at its left side.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-viewport-safe-size-with-boundary.jpg)

#### The Overlay Custom Config

This type contains properties to customize the overlay and it is used in the [`customConfig() method`](#the-customconfig-method) and inside either [the Component](#the-overlay-component) or [the Directive](#the-overlay-directive).

It also extends the properties from [the Overlay Config](#the-overlay-config) and [the Internal Config](#the-overlay-internal-config).

- **Type:** `OverlayCustomConfig`.
- **Properties:**
  - [`selector`](#the-selector).
  - [`arrowSize`](#the-arrow-size).
  - [`fadeMs`](#the-fade-timeout).
  - [`fadeDelayMs`](#the-fade-delay-timeout).
  - [`zIndex`](#the-zindex).
  - [`padding`](#the-padding).
  - [`shadow`](#the-shadow).
  - [`backgroundColor`](#the-background-color).
  - [`textColor`](#the-text-color).
  - [`borderSize`](#the-border-size).
  - [`borderColor`](#the-border-color).
  - [`borderRadius`](#the-border-radius).
  - [`maxWidth`](#the-max-width).
  - [`maxHeight`](#the-max-height).
  - [`className`](#the-class-names).
  - [`allowTabCycle`](#the-directive-tab-cycle-listener).
  - [`allowClose`](#the-directive-close-listeners).

##### The Selector

It defines the selector of the element where all behavior and styles will be applied to.

- **Config Property:** `selector`.
- **Type:** `string`.

##### The Arrow Size

It defines the size of the arrow.

- **Input / Config Property:** `arrowSize`.
- **Type:** `number`.
- **Default:** `7`.
- **Accepts:** zero or greater.
- **Translated to:** _pixels_.
- **CSS Variable:** `--overlay-arrow`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-arrow-size.jpg)

##### The Offset Size

It defines the space between the overlay and its trigger.

- **Input / Config Property:** `offsetSize`.
- **Type:** `number`.
- **Default:** `5`.
- **Accepts:** positives and negatives.
- **Translated to:** _pixels_.

> **NOTE:** Even if this property could be considered as a "style", it is actually used as an internal calculation within the Overlay Base Class, it doesn't contain a CSS variable.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-offset-size.jpg)

##### The Fade Timeout

It defines the timeout to fade in or out the overlay.

> **NOTE:** The value will result on the combination between _this value_ and `fadeDelayMs` value.

- **Input / Config Property:** `fadeMs`.
- **Type:** `number`.
- **Default:** `150`.
- **Translated to:** _milliseconds_.
- **CSS Variable:** `--overlay-fade-ms`.

###### The Fade Delay Timeout

It is the time it will take to start to fade in or out after the overlay is shown or hidden.

- **Input / Config Property:** `fadeDelayMs`.
- **Type:** `number`.
- **Default:** `0`.
- **Translated to:** _milliseconds_.

##### The zIndex

It defines the `z-index` CSS value.

This can be helpful for scenarios where the page contains fixed landmarks. See [the Safe Space and zIndex issues](#the-safe-space-and-zindex-issues).

- **Input / Config Property:** `zIndex`.
- **Type:** `number`.
- **Default:** `9999`.
- **CSS Variable:** `--overlay-zindex`.

##### The Padding

It defines the `padding` CSS value.

- **Input / Config Property:** `padding`.
- **Type:** `string`.
- **Default:** `'10px 16px'` (`10px` top & bottom, `16px` left & right).
- **CSS Variable:** `--overlay-padding`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-padding-size.jpg)

##### The Shadow

It defines the `box-shadow` CSS value, by combining two properties:

- **Input / Config Property:** `shadow`.
  - **Type:** `string`.
  - **Default:** `var(--a11y-shadow)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.
  - **CSS Variable:** `--overlay-shadow`.
- **Input / Config Property:** `shadowColor`.
  - **Type:** `string`.
  - **Default:** `var(--a11y-shadow-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.
  - **CSS Variable:** `--overlay-shadow-color`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-shadow.jpg)

##### The Background Color

It defines the `background-color` CSS value.

- **Input / Config Property:** `backgroundColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-bg-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.
- **CSS Variable:** `--overlay-bg-color`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-background-color.jpg)

##### The Text Color

It defines the `color` CSS value.

- **Input / Config Property:** `textColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-text-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.
- **CSS Variable:** `--overlay-text-color`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-text-color.jpg)

##### The Border Size

It defines the `border-width` CSS value.

- **Input / Config Property:** `borderSize`.
- **Type:** `number`.
- **Default:** `1`.
- **Translated to:** _pixels_.
- **CSS Variable:** `--overlay-border-size`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-border-size.jpg)

##### The Border Color

It defines the `border-color` CSS value.

- **Input / Config Property:** `borderColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-border-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.
- **CSS Variable:** `--overlay-border-color`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-border-color.jpg)

##### The Border Radius

It defines the `border-radius` CSS value.

- **Input / Config Property:** `borderRadius`.
- **Type:** `number`.
- **Default:** `5` (same for each corner).
- **Translated to:** _pixels_.
- **CSS Variable:** `--overlay-border-radius`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-border-radius.jpg)

##### The Max Width

It defines the maximum width allowed for the overlay.

> **NOTE:** The width of the viewport/boundary are also considered as the maximum width allowed by default, but it's **_really important_** that, if the overlay contains a big amount of text or dynamic content (in terms of width), you set a specific `maxWidth` value.

- **Input / Config Property:** `maxWidth`.
- **Type:** `string`.
- **Default:** `'auto'`.
- **You can use:** `px`, `em`, `%`, etc.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-max-width.jpg)

##### The Max Height

It defines the maximum height allowed for the overlay.

- **Input / Config Property:** `maxHeight`.
- **Type:** `string`.
- **Default:** _unset_.
- **You can use:** `px`, `em`, `%`, etc.

> **NOTE:** The height of the viewport/boundary are also considered as the maximum height allowed by default. When you set a `maxHeight` value and the content exceeds it, a vertical overflow will appear (this _behavior_ applies only for [the Component](#the-overlay-component), since is the one that contains a template with a stylesheet).
>
> If you plan on using [the Directive](#the-overlay-directive), please consider adding `overflow` to an element within the main wrapper.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-max-height.jpg)

##### The Class Names

It defines custom class names for your overlay element.

- **Config Property:** `className`.
- **Type:** `string` or `string[]`.
- **Default:** _unset_.

> **NOTE:** This can be useful for custom styles or specific scenarios where [the overlays are created outside the given selector](#the-service-create-method-using-a-domrect-trigger).

### The Types

#### The Overlay Position

Means the relative position to the trigger.

- **Type:** `OverlayPosition`.
- **From the Base library `enum`:** `POSITION`.
- **Default:** `'top'`.
- **Values:**
  - `'top'`.
  - `'bottom'`.
  - `'left'`.
  - `'right'`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-position.jpg)

##### The Overlay Reposition

The repositioning will depend on the chosen `position`.

For instance, if the overlay position is set to `'top'`, it will check if there is enough space to be placed there. If not, it will try at `'bottom'`, then at `'left'` and finally at `'right'`.

The order would be:

- `'top'` -> `'bottom'` -> `'left'` -> `'right'`.
- `'bottom'` -> `'top'` -> `'left'` -> `'right'`.
- `'left'` -> `'right'` -> `'top'` -> `'bottom'`.
- `'right'` -> `'left'` -> `'top'` -> `'bottom'`.

> **NOTE:** If at any point, the overlay (especially when `resize` event occurs on the page) doesn't have enough space at any of the allowed sides to fit its maximum size, it will choose the one with [more square area](#the-overlay-reposition-by-square-areas).
>
> Check also [the `fluidSize` On or Off](#the-fluid-size-on-or-off).

###### The Overlay Reposition by Square Areas

In the next scenario, the overlay has a `top` position with `positionsAllowed` set to `'opposite'`, which means only `top` or `bottom` are allowed.

Given the current overlay's maximum size is set to `300px` by `262px`, its height exceeds both allowed sides (`205px` at top and `147px` at bottom), so the overlay will choose the one with more available square area:

- top: `770 x 205 = 157850` ✔️.
- bottom: `770 x 147 = 113190` ❌.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-square-areas.jpg)
![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-square-areas-result.jpg)

#### The Overlay Alignment

Means the relative alignment to the trigger.

- **Type:** `OverlayAlignment`.
- **From the Base library `enum`:** `ALIGNMENT`.
- **Default:** `'center'` (or `'start'` if `alignmentsAllowed` is set to `'edges'`).
- **Values:**
  - `'start'`.
  - `'center'`.
  - `'end'`.

##### The Overlay Alignment Horizontally

This applies for `top` and `bottom` positions.

- `start`: means aligned to the left side of the trigger.
- `center`: means aligned to the center of the trigger.
- `end`: means aligned to the right side of the trigger.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-alignment-horizontal.jpg)

##### The Overlay Alignment Vertically

This applies for `left` and `right` positions.

- `start`: means aligned to the top side of the trigger.
- `center`: means aligned to the center of the trigger.
- `end`: means aligned to the bottom side of the trigger.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-alignment-vertical.jpg)

##### The Overlay Realignment

The realignment will depend on the chosen `alignment`.

For instance, if the overlay alignment is set to `'center'`, it will check if there is enough space to be placed there. If not, it will try at `'start'` and finally at `'end'`.

Now, if `alignmentsAllowed` is set to `'edges'`, checking for `'center'` alignment will be completelly ignored, checking first at `'start'` and finally at `'end'`.

## The Directive or the Component?

While I strongly recommend using the component, there could be scenarios where you need/want to use the directive.

Here are the main differences between the component and the directive:

- [The Component](#the-overlay-component):
  - It will handle the content and calculations better, since it contains a template and a stylesheet that already covers all possible scenarios.
  - All styles are applied through CSS variables.
  - Check [the Component Use](#the-component-use) example.
- [The Directive](#the-overlay-directive):
  - It will apply all styles to the host element as inline CSS.
  - Check [the Directive Use](#the-directive-use) example.

## The Overlay Directive

The `OverlayDirective` extends from [the `OverlayBase` class library](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-overlay-base-class).

- **Selector:** `[a11yOverlay]`.
- **Exported As:** `a11yOverlay`.

Behind the scenes, this one will take care of:

- Save/update all the configurations.
- The logic to show, hide and/or toggle.
- Set the position of the overlay when calculated.
- It will create [the Arrow Component](#the-overlay-arrow-component) within the _host_ element, if [`arrowSize`](#the-arrow-size) is set with a value greater than zero.

### The Directive Inputs

| Name | Type | Description |
| :--- | :--- | :---------- |
| `config` | `OverlayCustomConfig` or `string` | See [the Overlay Custom Config](#the-overlay-custom-config) or [the Config Input through a `string`](#the-config-input-through-a-string) |
| `trigger` | `HTMLElement` | See [the Trigger element](#the-trigger-element) |
| `boundary` | `HTMLElement` | See [the Custom Boundary](#the-custom-boundary) |
| `position` | `OverlayPositionInput` | See [the Position Input](#the-position-input) |
| `positionsAllowed` | `OverlayPositionsAllowedInput` | See [the Positions Allowed Input](#the-positions-allowed-input) |
| `alignmentsAllowed` | `OverlayAlignmentsAllowedInput` | See [the Alignments Allowed Input](#the-alignments-allowed-input) |
| `fluidAlignment` | `boolean` | See [the Fluid Alignment](#the-fluid-alignment) |
| `fluidSize` | `boolean` | See [the Fluid Size](#the-fluid-size) |
| `positionStrategy` | `OverlayPositionStrategy` | See [the Position Strategy](#the-position-strategy) |
| `safeSpace` | `OverlaySafeSpace` | See [the Safe Space](#the-safe-space) |
| `arrowSize` | `number` | See [the Arrow Size](#the-arrow-size) |
| `offsetSize` | `number` | See [the Offset Size](#the-offset-size) |
| `fadeMs` | `number` | See [the Fade Timeout](#the-fade-timeout) |
| `fadeDelayMs` | `number` | See [the Fade Delay Timeout](#the-fade-delay-timeout) |
| `zIndex` | `number` | See [the zIndex](#the-zindex) |
| `padding` | `string` | See [the Padding](#the-padding) |
| `shadow` | `string` | See [the Shadow](#the-shadow) |
| `shadowColor` | `string` | See [the Shadow](#the-shadow) |
| `backgroundColor` | `string` | See [the Background Color](#the-background-color) |
| `textColor` | `string` | See [the Text Color](#the-text-color) |
| `borderSize` | `string` | See [the Border Size](#the-border-size) |
| `borderColor` | `string` | See [the Border Color](#the-border-color) |
| `borderRadius` | `number` | See [the Border Radius](#the-border-radius) |
| `maxWidth` | `string` | See [the Max Width](#the-max-width) |
| `maxHeight` | `string` | See [the Max Height](#the-max-height) |
| `allowScrollListener` | `boolean` | See [the Page Scroll Listener](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-page-scroll-listener) in the Base Class library |
| `allowClose` | `boolean` or `OverlayAllowClose` | See [the Directive Close Listeners](#the-directive-close-listeners) |
| `allowTabCycle` | `boolean` | See [the Tab Cycle Listener](#the-directive-tab-cycle-listener) |
| `firstFocusOn` | `'first'` or `'last'` or `undefined` | See [the Directive Focus on Overlay First](#the-directive-focus-on-overlay-first) |
| `forceScheme` | `string` | See [how to Force a Scheme](#how-to-force-a-scheme) |

#### The Config Input

Is the given `OverlayCustomConfig` object or `string` that you could pass on for that specific overlay.

- **Input / Config Property:** `config`.
- **Type:** `OverlayCustomConfig` or `string`.

The `object` will contain all the needed properties, while the `string` will be treated as the `selector`, and make a reference for a sub level configuration (previously set in the [customConfig() Method](#the-customconfig-method)).

> **NOTE:** The `object` can also contain the [`selector` property](#the-config-input-through-an-object), which means that you can set _that_ "sub level" configuration inside the object, plus some extra other configs for that instance.

##### The Config Input Examples

Whenever you create an overlay, either by using a [directive](#the-overlay-directive), a [component](#the-overlay-component) or the [create service](#the-overlay-create-service), you can pass a [configuration object](#the-config-input-through-an-object) or a [string](#the-config-input-through-a-string) into the `[config]` input.

###### The Config Input through an Object

The object will contain the needed properties for customization. Optionally, if needed, you can also make use of the `selector` property, to define the specific configuration sub set established within [the `customConfig()` method](#the-customconfig-method).

```typescript
import { OverlayCustomConfig } from '@a11y-ngx/overlay';

...

@ViewChild('overlayTrigger', { static: true }) overlayTrigger: ElementRef<HTMLButtonElement>;

overlayConfig: OverlayCustomConfig = {
    selector: 'my-custom-component',
    trigger: this.overlayTrigger.nativeElement,
    position: ['right', 'end'],
    arrowSize: 0,
};
```

```html
<button #overlayTrigger>My Button</button>
<a11y-overlay [config]="overlayConfig" maxWidth="300px">...</a11y-overlay>
```

###### The Config Input through a String

When a `string` is passed as a config, it is going to be treated as the `selector` that was set within the `config` when [customConfig() Method](#the-customconfig-method) was used, to configure a sub level of overlays that will live under that selector in the DOM.

```html
<a11y-overlay config="my-custom-component" ...>...</a11y-overlay>
```

###### The Config Input through the `OverlayCreateService`

Is the third parameter for the `createOverlay()` method from the [Overlay Create Service](#the-overlay-create-service).

You can follow the examples above, and pass either [an Object](#the-config-input-through-an-object) or [a String](#the-config-input-through-a-string).

### The Directive Outputs

| Name | Type | Description |
| :--- | :--- | :---------- |
| `overlayOpen` | `EventEmitter<void>` | Will emit when `show()` method is invoked |
| `overlayClose` | `EventEmitter<void>` | Will emit when `hide()` method is invoked, and right after [the fade timeout](#the-fade-timeout) has completed |
| `overlayToggle` | `EventEmitter<string>` | Will emit values of `'open'` or `'close'`, accordingly |

### The Directive public Methods, Properties, Getters and Setters

| Name | Type | Of Type | Description |
| :--- | :--- | :------ | :---------- |
| `nativeElement` | `get` | `HTMLElement` | The host element: `<a11y-overlay>` for the component or the HTML element for the directive |
| `isVisible` | `get` | `boolean` | It means that the host element is reachable within the DOM.<br />It doesn't mean is "visually visible" |
| `isOpaque` | `get` | `boolean` | The Overlay is "visually visible", is fully opaque. |
| `borderSize` | `get`/`set` | `number` | See [the Border Size](#the-border-size) |
| `arrowSize` | `get`/`set` | `number` | See [the Arrow Size](#the-arrow-size) |
| `fadeMs` | `get`/`set` | `number` | See [the Fade Timeout](#the-fade-timeout) |
| `fadeDelayMs` | `get`/`set` | `number` | See [the Fade Delay Timeout](#the-fade-delay-timeout) |
| `zIndex` | `get`/`set` | `number` | See [the zIndex](#the-zindex) |
| `setOverlayConfig()` | `method` | `void` | See [how to set the Overlay Config](#the-directive-setoverlayconfig-method) |
| `setStyles()` | `method` | `void` | See [how to set the Directive Styles](#the-directive-setstyles-method) |
| `setCustomSelector()` | `method` | `void` | See [how to set the Directive Custom Selector](#the-directive-setcustomselector-method) |
| `show()` | `method` | `void` | See [the Directive Show method](#the-directive-show-method) |
| `hide()` | `method` | `void` | See [the Directive Hide method](#the-directive-hide-method) |
| `toggle()` | `method` | `void` | See [the Directive Toggle method](#the-directive-toggle-method) |
| `overlayUpdated$` | `property` | `Subject<OverlayBaseCalculatedPosition>` | To listen to the data when the directive updates the host's position. See [the calculated position (from the Base Class library)](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-calculated-position) |
| `destroy$` | `property` | `Subject<void>` | To listen to for when the directive gets destroyed |

#### The Directive `setOverlayConfig()` Method

Serves to set the directive's config.

Accepts a single parameter `config` of type [`OverlayCustomConfig`](#the-overlay-custom-config).

It is executed every time a directive is created and on change life cycle.

#### The Directive `setStyles()` Method

Serves to set the custom given styles into the host element.

Accepts a single parameter `theStyles` of type [`OverlayCustomConfig`](#the-overlay-custom-config), which will only process [the properties meant for styling](#the-styles-config).

It is executed on the directive's change life cycle, right after [the `setOverlayConfig()` method](#the-directive-setoverlayconfig-method).

#### The Directive `setCustomSelector()` Method

To be used when an instance of a custom component is created extending the directive as a base.

This way you can set your custom component's selector so the directive can make use of the Color Scheme service properly.

Accepts a single parameter `selector` of type `string`.

#### The Directive `show()` Method

Shows the overlay and sets its position.

This means that:

1. It will replace the `display: none;` for `display: flex;` CSS property:<br />
   This is the first step so the _Base Class_ can have access to the overlay's `DOMRect` data to calculate its current size.
2. It will set focus on the overlay element (if [`allowTabCycle`](#the-directive-tab-cycle-listener) is set to `true`).
3. It will emit `overlayOpen` and `overlayToggle`.
4. It will attach the overlay and listen for changes (window resize and/or scroll) to update its coordinates and/or max sizes.
5. It will start to fade in the host element after _n_ milliseconds (established by [the `fadeDelayMs` property](#the-fade-delay-timeout)).
6. It will push the _calculated position_ into `overlayUpdated$` subject.

#### The Directive `hide()` Method

Hides the overlay.

This means that:

1. It will fade out the host element.
2. It will detach the overlay.
3. It will set focus back on the trigger element (if [`allowTabCycle`](#the-directive-tab-cycle-listener) is set to `true`) and the trigger is an instance of `HTMLElement` (not a `DOMRect`).
4. After those _n_ milliseconds (established by [the fadeMs property](#the-fade-timeout) and [the `fadeDelayMs` property](#the-fade-delay-timeout)) it will:
    1. Add the `display: none;` CSS property.
    2. Emit `overlayClose` and `overlayToggle`.

#### The Directive `toggle()` Method

It will switch between `show()` or `hide()` methods, based on the `isVisible` getter.

### The Directive Listeners

Since the main idea of this library is to help on accessibility matters, for those that can have specific content where the user needs to explore with their keyboards, both [tab cycle](#the-directive-tab-cycle-listener) and [close on escape](#the-directive-close-on-escape-listener) listeners are available.

#### The Directive Close Listeners

Allows to set the "on close" listeners: **Escape** and/or **Click Outside**.

- **Input / Config Property:** `allowClose`.
- **Type:** `boolean` or `OverlayAllowClose`.
- **Default:** `true`.

If a boolean is passed, then both "[close on escape](#the-directive-close-on-escape-listener)" and "[close on click outside](#the-directive-close-on-click-outside-listener)" are going to be configured with that value.

On the other hand, if the `OverlayAllowClose` type is used, you can find 2 properties to set individually:

- `escape` of type `boolean`.
- `clickOutside` of type `boolean`.

> ⚠️ **IMPORTANT:** Be careful about this option, **do not set this to `false` by default**, specially when [`allowTabCycle`](#the-directive-tab-cycle-listener) is set to `true`, otherwise the focus will remain inside the overlay and keyboard **users won't be able to close it**.
>
> This option should be considered when you are providing other ways to close the overlay, such as custom listeners (`mouseleave` or `blur`) or custom buttons, like "Close" or "Confirm & Cancel".

##### The Directive Close on Escape Listener

Allows to close the overlay by pressing the `escape` key, either if the [tab cycle](#the-directive-tab-cycle-listener) is on or off.

- **Input / Config Property:** `allowClose` or `allowClose.escape`.
- **Type:** `boolean`.
- **Default:** `true`.

> **NOTE:** The `escape` listener will be attached to different elements according to:
>
> - If `allowTabCycle` is set to `true`, the listener will be in the **overlay** element.
> - If `allowTabCycle` is set to `false`, the listener will be in the **trigger** element.
> - If no trigger element is present (because a [DOMRect was provided instead](#the-service-create-method-using-a-domrect-trigger)), the listener will be in the **document** element.

##### The Directive Close on Click Outside Listener

Allows to close the overlay when the user clicks outside of it.

- **Input / Config Property:** `allowClose` or `allowClose.clickOutside`.
- **Type:** `boolean`.
- **Default:** `true`.

#### The Directive Tab Cycle Listener

If the content has interactive/tabbable elements, it is highly recommended that the focus is set to the overlay and remains within. So, whenever the user uses the `tab` key, the cycle will be among all focusable elements and should not be lost outside.

The same way focus is set within the overlay, it will return to the trigger when the overlay closes, either by using the [escape key](#the-directive-close-on-escape-listener) or the [`hide()` method](#the-directive-hide-method) (because you **must implement** another way to close it via keyboard, like a close button).

- **Dependency:** [Tab Cycle package](https://www.npmjs.com/package/@a11y-ngx/tab-cycle).
- **Input / Config Property:** `allowTabCycle`.
- **Type:** `boolean`.
- **Default:** `true`.

> **NOTE:** When set to `true`, a set of attributes will be established automatically to the overlay element:
>
> - `tabindex="-1"` (if no value was provided)
> - `role="dialog"`
> - `aria-modal="true"`
>
> This way, screen reader users can have the full and addecuate experience when navigate with their keyboards.
>
> ⚠️ **IMPORTANT:** This feature does not apply if you are, for instance, creating a [context menu](#the-context-menu) since they are navigated using the arrow keys and the `role` should be of type `menu` and `menuitem` along with other aria attributes.

##### The Directive Focus on Overlay First

If `allowTabCycle` is set to `true`, this property will define where the first focus is going to be set.

- **Input / Config Property:** `firstFocusOn`.
- **Type:** `'first'`, `'last'` or `undefined`.
- **Default:** `undefined`.

By default, focus will be set on the overlay element. If is set to `'first'`, focus goes to the first tabbable element; if set to `'last'` then goes to the last tabbable element (or the overlay, if none were found).

> **Regarding Accessibility:** There has been a big discussion on if the focus should be set on the main container element or the first interactive element.
>
> Most people recommend to set focus on the first interactive element, expecting to be a "close button".
>
> Now imagine that you have some explainatory text and _then_ a couple of buttons to "accept" or "cancel". By setting the focus to the first interactive element (the "accept" button in this case), the screen reader users will lost the context of the message, since they are going to be standing at the end of the container.
>
> Please choose wisely if you change this option to `'first'` or `'last'`.

## The Overlay Component

The `OverlayComponent` extends from [the `OverlayDirective` class](#the-overlay-directive).

- **Selector:** `'a11y-overlay'`.
- **Exported As:** `a11yOverlay`.

Behind the scenes, this one will take care of using all the styles through the stylesheet.

The stylesheet will make use of the values established within [the Config Styles Type](#the-styles-config) for:

- [`fadeMs`](#the-fade-timeout).
- [`padding`](#the-padding).
- [`shadow`](#the-shadow).
- [`shadowColor`](#the-shadow).
- [`backgroundColor`](#the-background-color).
- [`textColor`](#the-text-color).
- [`borderSize`](#the-border-size).
- [`borderColor`](#the-border-color).
- [`borderRadius`](#the-border-radius).
- [`zIndex`](#the-zindex).

## The Overlay Arrow Component

- **Selector:** `'a11y-overlay-arrow'`.

This component has no template, it only contains a stylesheet to show an arrow-like shape "visually attached" on the overlay, pointing to the trigger.

The component will subscribe to the `overlayUpdated$` property from the directive to update the arrow's position.

The stylesheet will make use of the values established within [the Config Styles Type](#the-styles-config) for:

- [`arrowSize`](#the-arrow-size).
- [`backgroundColor`](#the-background-color).
- [`borderSize`](#the-border-size).
- [`borderColor`](#the-border-color).

### The Arrow Component inside the Directive

If you are going to use an overlay directive, instead of a component, and specially if your intention is to use `overflow`, please consider wrapping the content within a new `<div>` element and apply the overflow to _that_ div, to avoid issues with the arrow.

See an example of [the Directive Use](#the-directive-use).

## The Overlay Create Service

This service becomes useful when you want to use a `TemplateRef` content for the overlay.

It provides a [method to create the overlay](#the-service-create-method) and a [method to destroy it](#the-service-destroy-method), if needed.

### The Service Create Method

The `createOverlay()` method creates (and returns) an `OverlayComponent` instance and uses the given template as its content. The `<ally-overlay>` element will be rendered right after the trigger in the DOM (if given) or within a _container_ at the end of the `<body>` (if `DOMRect` was provided).

Accepts three parameters:

- `trigger` of type `HTMLElement` or `DOMRect`.
- `content` of type `TemplateRef<unknown>` or `string`.
- `config` (_optional_) of type [OverlayCustomConfig](#the-config-input-through-an-object) or [string](#the-config-input-through-a-string).

> **NOTE:** If you need to remove the rendered `<ally-overlay>` element at any point, you can use [the Overlay Destroy method](#the-service-destroy-method) from the returned component instance.

#### The Service Create Method using an `HTMLElement` Trigger

```typescript
import { OverlayComponent, OverlayCreateService } from '@a11y-ngx/overlay';

...

@ViewChild('overlayTrigger') overlayTrigger: ElementRef<HTMLButtonElement>;
@ViewChild('overlayTemplate') overlayTemplate: TemplateRef<any>;

private myOverlay: OverlayComponent;

constructor(private overlayCreateService: OverlayCreateService) {}

toggleOverlay(): void {
    if (!this.myOverlay) {
        this.myOverlay = this.overlayCreateService.createOverlay(
            this.overlayTrigger.nativeElement, // trigger
            this.overlayTemplate,              // content
            {                                  // config
                position: ['bottom', 'end'],
                fadeMs: 500,
            });
    }

    this.myOverlay.toggle();
}
```

```html
<button #overlayTrigger (click)="toggleOverlay()">My Button</button>
<ng-template #overlayTemplate>...</ng-template>
```

#### The Service Create Method using a `DOMRect` Trigger

Since there is no actual `trigger` HTML element, another service will attach the overlay to a _container_ in the `<body>`.

These scenarios can be useful for overlays that are not visually attached to _anything_, such as context menus, where only `x` and `y` coordinates (the clicked point) are needed to position the overlay.

> 📘 **NOTE:** You can see the extended version of the following code in [the Context Menu example](#the-context-menu)

```typescript
@HostListener('document:contextmenu', ['$event'])
    private onContextMenu(event: PointerEvent): void {
        event.preventDefault();

        if (!this.myOverlay) {
            this.myOverlay = this.overlayCreateService.createOverlay(
                new DOMRect(event.x, event.y, 0, 0), // trigger
                this.overlayTemplate,                // content
                '.context-menu'                      // config's selector
            );
        }

        this.myOverlay.toggle();
    }
```

### The Service Destroy Method

The `destroyOverlay()` method serves the purpose of destroying the rendered `<ally-overlay>` element from the DOM.

It can be invoked from the component instance generated in [the Service Create method](#the-service-create-method).

```typescript
this.myOverlay.destroyOverlay();
this.myOverlay = undefined;
```

## The Color Schemes

This library uses [Color Scheme package](https://www.npmjs.com/package/@a11y-ngx/color-scheme) as a dependency so you can make use of the two basic color schemes: `light` and `dark` (or more).

### How to Configure the Color Schemes

You can establish all the color related stuff for the preset schemes (`light` and `dark`) or any other you may have added when using the `rootConfig()` method.

- **Config Property:** `colorSchemes`.
- **Properties:**
  - `light`.
  - `dark`.
  - _'code-name'_ (any other).

Let's say you don't like the default text color for the `light` scheme (`#222`), then you can change it like this:

```typescript
A11yOverlayModule.rootConfig({
    ...
    safeSpace: { top: 65, left: 50 },
    borderSize: 2,
    ...
    colorSchemes: {
        light: {
            textColor: '#000',
        },
        dark: {...},
        'red-velvet': {...}, // being 'red-velvet' the code-name
    },
}),
```

> **NOTES:**
>
> 1. You can add any other _generic_ style value from the config (not related to color) at the _root_ level of the object provided, as shown for the `borderSize` property.
> 2. If you add a color-related property at the _root_ level, it will be treated as _generic_ and will affect all overlays.

### How to Force a Scheme

Even when the color scheme is set to a specific value (globally), you can force an overlay to use another.

- **Input / Config Property:** `forceScheme`.
- **Type:** `ColorScheme` (aka `string`, aka _'code-name'_).

> **NOTE:** To _reset_ an already set forced scheme, use the value `'auto'`.

I've added a third color scheme for testing purposes called `'red-velvet'`.

As you can see in the example below:

- The first overlay doesn't have the property, so it will use the system's default (`light` in this case).
- The second overlay has `forceScheme` set with `red-velvet`.
- The third overlay has `forceScheme` set with `dark`.

```html
<div class="row">
    <div class="col text-center">
        <button type="button" #triggerLight (click)="overlayLight.toggle()">
            My button
        </button>
        <a11y-overlay #overlayLight [trigger]="triggerLight">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        </a11y-overlay>
    </div>
    <div class="col text-center">
        <button type="button" #triggerRedVelvet (click)="overlayRedVelvet.toggle()">
            My button
        </button>
        <a11y-overlay #overlayRedVelvet [trigger]="triggerRedVelvet" forceScheme="red-velvet">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        </a11y-overlay>
    </div>
    <div class="col text-center">
        <button type="button" #triggerDark (click)="overlayDark.toggle()">
            My button
        </button>
        <a11y-overlay #overlayDark [trigger]="triggerDark" forceScheme="dark">
            Lorem ipsum dolor sit amet consectetur, adipisicing elit.
        </a11y-overlay>
    </div>
</div>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-color-scheme.jpg)

### How to add a New Color Scheme

Since Color Scheme package is a dependency, you can add new schemes if you need to. You can use the `rootConfig()` method on the `A11yColorSchemeModule` in your app.

The properties you can configure within the `scheme` object are:

- `a11yBackgroundColor`
- `a11yTextColor`
- `a11yBorderColor`
- `a11yShadow`
- `a11yShadowColor`

> **NOTE:** Any property you don't define, it will use the value defined within `light`.

```typescript
A11yColorSchemeModule.rootConfig({
    newSchemes: [
        {
            value: 'red-velvet',
            name: 'Red Velvet',
            scheme: {
                a11yBackgroundColor: '#590811',
                a11yTextColor: '#FFEEEE',
                a11yBorderColor: '#995555',
                a11yShadowColor: '#995555',
            },
        }
    ],
}),
```

## Examples

### The Component Use

By using the component, you can forget about applying any styles, since they will be automatically covered (check [the properties for styling](#the-styles-config)). Just add the `<a11y-overlay>` in your template and connect it to a trigger:

```html
<button
    type="button"
    #overlayTrigger
    (click)="overlayElement.toggle()">
    My Button
</button>
<a11y-overlay
    #overlayElement="a11yOverlay"
    [trigger]="overlayTrigger"
    maxWidth="400px">
    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consectetur quam magnam eum quis quo minus voluptas rerum necessitatibus aspernatur consequatur quidem odit perferendis esse, illum quasi numquam distinctio deserunt voluptate?
</a11y-overlay>
```

In the above example, each element has its own template variable defined and assigned to each other.

- We pass `overlayTrigger` as the `[trigger]` in the `<a11y-overlay>` element.
- We save the component's reference in `overlayElement` and pass it to the trigger's `(click)` event so it can toggle its visibility.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-component-use.jpg)

### The Directive Use

Use any HTML element as the overlay and apply the `a11yOverlay` directive to it in your template.

```html
<button
    type="button"
    #overlayTrigger
    (click)="overlayElement.toggle()">
    My Button
</button>
<div
    a11yOverlay
    #overlayElement="a11yOverlay"
    [trigger]="overlayTrigger"
    maxWidth="400px"
    borderColor="#88127A"
    padding="10px">
    Lorem ipsum dolor sit amet consectetur, adipisicing elit. Consectetur quam magnam eum quis quo minus voluptas rerum necessitatibus aspernatur consequatur quidem odit perferendis esse, illum quasi numquam distinctio deserunt voluptate?
</div>
```

The same way as [the component use example](#the-component-use), we need to pass the trigger element into the overlay and handle the `toggle()` within the trigger's click event.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-directive-use.jpg)

> **IMPORTANT:** If you plan on using overflow at some point into your main `<div>` element, instead add a new wrapper to its content and provide the proper overflow to _that_ element, since the arrow component is rendered in the main element and will be lost with the use of overflow.
>
> ```html
> <div a11yOverlay>
>     <!-- 👇 needed for the arrow element does not get lost within the overflow -->
>     <div style="overflow: auto; max-height: 200px;">
>         Lorem ipsum dolor sit amet consectetur, adipisicing elit.
>     </div>
> </div>

### The Responsive Table

One of the most common issues when overflow strikes, is how to properly show the overlay that lies within.

By having the [position strategy](#the-position-strategy) set to `fixed`, the overlay could stay visible even when the trigger is hidden because of the scrolling.

In the next example we can find a table wrapped with a container with auto overflow.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-responsive-table-overview.jpg)

The moment we show a couple of _tooltips_, we can see how they overlap the container. No problem this far, everything looks good.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-responsive-table-tooltips-zoom-out.jpg)

Now we zoom in the page, to force the overflow, and we can see how both tooltips are positioned to the left of their triggers, but the "delete" one is _kind of_ out of (over) the container.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-responsive-table-tooltips-zoom-in.jpg)

To avoid this type of scenarios, we need to:

1. Set `position: relative;` to the container.
2. Establish for every tooltip:
    1. The [position strategy](#the-position-strategy) to `absolute`.
    2. The container as the [custom boundary](#the-custom-boundary).

So, in a normal (not zoomed in) view, the tooltips would be correctly contained by the boundary:

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-responsive-table-tooltips-zoom-out-fixed.jpg)

And even when we apply zoom, the tooltips would also be perfectly contained:

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-responsive-table-tooltips-zoom-in-fixed.jpg)

### The Context Menu

In the [using a `DOMRect` trigger example](#the-service-create-method-using-a-domrect-trigger), we had defined the `@HostListener()` for the `document:contextmenu` event.

> ⚠️ **NOTE 1:** Even when the logic for a context menu is far more complex than the following example, you can get a basic idea.
>
> ⚠️ **NOTE 2:** These type of scenarios require to have [the Tab Cycle](#the-directive-tab-cycle-listener) set to `false`, since context menus are not navigated using the `tab` key.
>
> 📘 **NOTE 3:** The styles used here are from [Bootstrap website](https://getbootstrap.com/docs/5.3/components/list-group/#links-and-buttons).

We can [configure the module using `customConfig()`](#the-customconfig-method) with:

- `'.context-menu'` as the selector.
- `'context-menu'` as a class name so it can match the selector and, therefore, the styles.
- Some resets on the global defaults.
- And to make it behave like a context menu:
  - Position: `'right'`.
  - Positions allowed: `'opposite'`.
  - Alignments allowed: `'edges'`.

```typescript
A11yOverlayModule.customConfig({
    selector: '.context-menu',
    padding: '0',
    offsetSize: 2,
    arrowSize: 0,
    borderSize: 0,
    shadow: '4px 4px 2px -2px',
    shadowColor: '#AAA',
    maxWidth: '190px',
    fadeMs: 10,
    className: 'context-menu',
    position: 'right',
    positionsAllowed: 'opposite',
    alignmentsAllowed: 'edges',
    allowTabCycle: false,
}),
```

We can extend our component with:

```typescript
import { OverlayComponent, OverlayCreateService } from '@a11y-ngx/overlay';

...

@ViewChild('overlayTemplate') overlayTemplate: TemplateRef<any>;

private myOverlay: OverlayComponent;

menuItems: string[] = ['Copy', 'Paste', 'Print', 'Save As...', 'Translate this page'];

constructor(private overlayCreateService: OverlayCreateService) {}

@HostListener('document:contextmenu', ['$event'])
    private onContextMenu(event: PointerEvent): void {
        event.preventDefault();

        if (!this.myOverlay) {
            this.myOverlay = this.overlayCreateService.createOverlay(
                new DOMRect(event.x, event.y, 0, 0),
                this.overlayTemplate,
                '.context-menu'
            );
        }

        if (this.myOverlay?.isVisible) {
            this.closeMenu();
        } else {
            this.openMenu();
        }
    }

private openMenu(): void {
    this.myOverlay.show();
}

private closeMenu(): void {
    this.myOverlay.hide();
}

menuItemClick(event: PointerEvent, menuItem: string): void {
    event.stopImmediatePropagation();
    event.preventDefault();

    // console.log(menuItem);

    this.closeMenu();
}
```

And our template with the options of the menu:

```html
<ng-template #overlayTemplate>
    <div class="list-group">
        <a href="#"
            *ngFor="let menuItem of menuItems"
            (click)="menuItemClick($event, menuItem)"
            class="list-group-item list-group-item-action">
            {{ menuItem }}
        </a>
    </div>
</ng-template>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/overlay/src/lib/images/example-context-menu.jpg)
