# Tooltip

A fully accessible Angular directive that provides a standards-compliant tooltip experience across mouse, keyboard and touch interactions.

It's built with WCAG 2.1/2.2 AA compliance in mind:

✔️ Shows on **mouse hover**, **focus** or **touch** (with configurable delay for each)<br />
✔️ Hides on **mouse leave**, **blur**, **touch outside** or **Escape** key (it also supports extra configurable keys for toggle its visibility)<br />
✔️ It remains visible even when hover over the tooltip<br />
✔️ It will also cover elements with `title` attribute (usually `<abbr>` or any other you may have)<br />
✔️ Color contrast ratio of at least 4.5:1 for the basic themes availables (`'light'` and `'dark'`)<br />
✔️ Ensures that the tooltip's text is always present for assistive technologies, either by the ARIA association between trigger and tooltip, or visually hidden text if it is not an interactive element<br />
✔️ It will open to the most appropriate side when space is limited on the preferred position<br />
✔️ It will reposition itself, if needed, in case of page scroll or resize<br />

> ⚠️ **IMPORTANT:** Think carefully at what you are adding a tooltip to, remember that there are people with disabilities who can't use a mouse and rely on a keyboard for navigation, so adding a tooltip to non-interactive elements (`<i>`, `<span>`, etc.) won't be reachable by keyboard and thus the tooltip won't appear.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Index

- [Installation](#installation)
- [The `rootConfig()` Method](#the-rootconfig-method)
- [The Tooltip Config](#the-tooltip-config)
  - [The Position Input](#the-position-input)
    - [The Positions Allowed Input](#the-positions-allowed-input)
    - [The Alignments Allowed Input](#the-alignments-allowed-input)
  - [The Position Strategy](#the-position-strategy)
  - [The Custom Boundary](#the-custom-boundary)
  - [The Safe Space](#the-safe-space)
  - [The Fluid Alignment](#the-fluid-alignment)
  - [The Arrow Size](#the-arrow-size)
  - [The Offset Size](#the-offset-size)
  - [The Fade Timeout](#the-fade-timeout)
  - [The Fade Delay Timeout](#the-fade-delay-timeout)
  - [The Delay On Event](#the-delay-on-event)
  - [The zIndex](#the-zindex)
  - [The Padding](#the-padding)
  - [The Shadow](#the-shadow)
  - [The Background Color](#the-background-color)
  - [The Text Color](#the-text-color)
  - [The Border Size](#the-border-size)
  - [The Border Border](#the-border-color)
  - [The Border Radius](#the-border-radius)
  - [The Max Width](#the-max-width)
  - [The Class Names](#the-class-names)
  - [Use Animate](#use-animate)
  - [Use Prevail](#use-prevail)
  - [Use As Label](#use-as-label)
  - [Toggle On](#toggle-on)
- [The `recalculate()` Method](#the-recalculate-method)
- [The Color Schemes](#the-color-schemes)
  - [How to Configure the Color Schemes](#how-to-configure-the-color-schemes)
  - [How to Force a Scheme](#how-to-force-a-scheme)
  - [How to add a New Color Scheme](#how-to-add-a-new-color-scheme)
- [The Use of Bootstrap Styles](#the-use-of-bootstrap-styles)
- [The Use with Image Maps](#the-use-with-image-maps)
- [The Use with Abbreviation Elements](#the-use-with-abbreviation-elements)
- [The Use with Non-Interactive Elements](#the-use-with-non-interactive-elements)

## Installation

1. Install npm package:

   `npm install @a11y-ngx/tooltip --save`

2. Import `A11yTooltipModule` into your module or standalone component:

```typescript
import { A11yTooltipModule } from '@a11y-ngx/tooltip';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yTooltipModule,
    ],
})
export class AppModule { }
```

### The `rootConfig()` Method

Serves to establish and override the global default configuration.

Accepts a single parameter `config` of type [`TooltipRootConfig`](#the-tooltip-config).

**On Angular v12 - v14:**

```typescript
A11yTooltipModule.rootConfig({
    offsetSize: 10,
    safeSpace: { top: 65, left: 50 },
}),
```

**On Angular v15+:**

```typescript
provideA11yTooltip({
    offsetSize: 10,
    safeSpace: { top: 65, left: 50 },
}),
```

## The Tooltip Config

The `TooltipConfig` provides several properties to customize.

- **Input:** `tooltipConfig`.
- **Type:** `TooltipConfig`.

> All color related default values (★) are coming from the variables set within [the Color Scheme global configuration](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties).

| Property | Type | Description |
|:---------|:-----|:------------|
| `position` | `OverlayPositionInput` | See [the Position Input](#the-position-input) |
| `positionStrategy` | `OverlayPositionStrategy` | See [the Position Strategy](#the-position-strategy) |
| `positionsAllowed` | `OverlayPositionsAllowedInput` | See [the Positions Allowed Input](#the-positions-allowed-input) |
| `alignmentsAllowed` | `OverlayAlignmentsAllowedInput` | See [the Alignments Allowed Input](#the-alignments-allowed-input) |
| `safeSpace` | `OverlaySafeSpace` | See [the Safe Space](#the-safe-space) |
| `fluidAlignment` | `boolean` | See [the Fluid Alignment](#the-fluid-alignment) |
| `arrowSize` | `number` | See [the Arrow Size](#the-arrow-size) |
| `offsetSize` | `number` | See [the Offset Size](#the-offset-size) |
| `fadeMs` | `number` | See [the Fade Timeout](#the-fade-timeout) |
| `fadeDelayMs` | `number` | See [the Fade Delay Timeout](#the-fade-delay-timeout) |
| `delayOnEvent` | `TooltipDelayEvents` | See [the Delay On Event](#the-delay-on-event) |
| `animate` | `boolean` | See [Use Animate](#use-animate) |
| `prevail` | `boolean` | See [Use Prevail](#use-prevail) |
| `asLabel` | `boolean` | See [Use as Label](#use-as-label) |
| `toggleOn` | `string[]` | See [Toggle On](#toggle-on) |
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
| `useBootstrapStyles` | `boolean` | See [Use Bootstrap Styles](#the-use-of-bootstrap-styles) |
  
As part as the config object, there is a set of properties for Color Scheme:
  
- **Dependency:** [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#the-color-scheme-config-styles-config).
- **Type:** `ColorSchemeStylesConfig`.
- **Properties:**
  
| Property | Type | Description |
|:---------|:-----|:------------|
| `colorSchemes` | `ColorSchemesStyles` | See [how to Configure the Color Schemes](#how-to-configure-the-color-schemes) |
| `forceScheme` | `ColorScheme` | See [how to Force a Scheme](#how-to-force-a-scheme) |

### The Position Input

To input, in a simple way, either position or position & alignment (hyphen separated if `string` is used).

- **Config Property:** `position`.
- **Type:** `OverlayPositionInput`.
- **Default:** `['top', 'center']`.

> For more details, check [the Position Input from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-position-input).

#### The Positions Allowed Input

To establish which positions are allowed.

- **Config Property:** `positionsAllowed`.
- **Type:** `OverlayPositionsAllowedInput`.
- **Default:** `'auto'` (all sides are allowed).
- **You can use:** `'auto'`, `'opposite'`, `string` or `string[]`.

> For more details, check [the Positions Allowed Input from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-positions-allowed-input).

#### The Alignments Allowed Input

To establish which alignments are allowed.

- **Config Property:** `alignmentsAllowed`.
- **Type:** `OverlayAlignmentsAllowedInput`.
- **Default:** `'auto'` (all alignments are allowed).
- **You can use:** `'auto'`, `'edges'`, an alignment value (`'start'`, `'center'`, `'end'`) or an array of them.

> For more details, check [the Alignments Allowed Input from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-alignments-allowed-input).

### The Position Strategy

To establish whether a `fixed` or `absolute` strategy positioning is used in CSS.

- **Config Property:** `positionStrategy`.
- **Type:** `OverlayPositionStrategy`.
- **Default:** `'fixed'`.
- **Values:** `'fixed'` or `'absolute'`.

The `absolute` strategy was designed mainly to be utilized inside containers with overflow (such as responsive tables) and to avoid the tooltip to be seen in case of scrolling while the trigger being visually hidden.

> For more details and examples, check [the Position Strategy from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-position-strategy).

### The Custom Boundary

A custom boundary can be interpreted as a wrapper/container, and the tooltip will consider that boundary as the new limits for its positioning.

- **Config Property:** `boundary`.
- **Type:** `HTMLElement`.
- **Default:** `<body>`.

> For more details and examples, check [the Custom Boundary from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-custom-boundary).

### The Safe Space

To establish an extra safe space to the viewport's edges in case some fixed areas are present, such as headers, side menus or footers.

This way, the tooltip will consider this area as the _edge limit_ and reposition itself if reached. Most useful use cases are related to scroll events.

- **Config Property:** `safeSpace`.
- **Type:** `OverlaySafeSpace`:
  - `object` with each side as a property of type `number`.
- **Default:** `{ top: 0, bottom: 0, left: 0, right: 0 }`.

> For more details and examples, check from the Overlay library:
>
> - [The Safe Space](https://www.npmjs.com/package/@a11y-ngx/overlay#the-safe-space).
>   - [The Safe Space Off](https://www.npmjs.com/package/@a11y-ngx/overlay#the-safe-space-off).
>   - [The Safe Space On](https://www.npmjs.com/package/@a11y-ngx/overlay#the-safe-space-on).
>   - [The Safe Space and zIndex Issues](https://www.npmjs.com/package/@a11y-ngx/overlay#the-safe-space-and-zindex-issues).

### The Fluid Alignment

To establish whether the tooltip's alignment will stick to the edges of the viewport/boundary (if set to `true`) or make jumps between `start`, `center` or `end` (if set to `false`).

- **Config Property:** `fluidAlignment`.
- **Type:** `boolean`.
- **Default:** `false`.

As you can see in the next example, the fluid alignment is set to `false` (by default), which will make the tooltip to be aligned to the "end" of its trigger since it's too close to the viewport's right side and doesn't have enough space to be centered (default alignment).

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-fluid-alignment-off.jpg)

If we turn fluid alignment on, then the tooltip will stick to the right side of the viewport.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-fluid-alignment-on.jpg)

> For more details and examples, check from the Overlay library
>
> - [The Fluid Alignment](https://www.npmjs.com/package/@a11y-ngx/overlay#the-fluid-alignment).
>   - [The Fluid Alignment On or Off](https://www.npmjs.com/package/@a11y-ngx/overlay#the-fluid-alignment-on-or-off).

### The Arrow Size

It defines the size of the arrow.

- **Config Property:** `arrowSize`.
- **Type:** `number`.
- **Default:** `5`.
- **Accepts:** zero or greater.
- **Translated to:** _pixels_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-arrow-size.jpg)

### The Offset Size

It defines the space between the tooltip's arrow and its trigger.

- **Config Property:** `offsetSize`.
- **Type:** `number`.
- **Default:** `5`.
- **Accepts:** positives and negatives.
- **Translated to:** _pixels_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-offset-size.jpg)

### The Fade Timeout

It defines the timeout to fade in or out the tooltip.

- **Config Property:** `fadeMs`.
- **Type:** `number`.
- **Default:** `125`.
- **Translated to:** _milliseconds_.

### The Fade Delay Timeout

It is the time it will take to start to fade in or out after the tooltip is shown or hidden.

- **Config Property:** `fadeDelayMs`.
- **Type:** `number`.
- **Default:** `400`.
- **Translated to:** _milliseconds_.

### The Delay On Event

To establish on which events should delay (`fadeDelayMs` property) when show/hide the tooltip.

- **Config Property:** `delayOnEvent`.
- **Type:** `TooltipDelayEvents`.
- **Default:** `{ mouse: true, keyboard: false, touch: false }`.

### The zIndex

It defines the `z-index` CSS value.

This can be helpful for scenarios where the page contains fixed landmarks. See [the Safe Space and zIndex issues from the Overlay library](https://www.npmjs.com/package/@a11y-ngx/overlay#the-safe-space-and-zindex-issues).

- **Config Property:** `zIndex`.
- **Type:** `number`.
- **Default:** `9999`.

### The Padding

It defines the `padding` CSS value.

- **Config Property:** `padding`.
- **Type:** `string`.
- **Default:** `'3px 7px'` (`3px` top & bottom, `7px` left & right).

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-padding-size.jpg)

### The Shadow

It defines the `box-shadow` CSS value, by combining two properties:

- **Config Property:** `shadow`.
  - **Type:** `string`.
  - **Default:** `none`.
- **Config Property:** `shadowColor`.
  - **Type:** `string`.
  - **Default:** `var(--a11y-shadow-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-shadow.jpg)

### The Background Color

It defines the `background-color` CSS value.

- **Config Property:** `backgroundColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-bg-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-background-color.jpg)

### The Text Color

It defines the `color` CSS value.

- **Config Property:** `textColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-text-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-text-color.jpg)

### The Border Size

It defines the `border-width` CSS value.

- **Config Property:** `borderSize`.
- **Type:** `number`.
- **Default:** `1`.
- **Translated to:** _pixels_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-border-size.jpg)

### The Border Color

It defines the `border-color` CSS value.

- **Config Property:** `borderColor`.
- **Type:** `string`.
- **Default:** `var(--a11y-border-color)` _(coming from the [Color Scheme library](https://www.npmjs.com/package/@a11y-ngx/color-scheme#user-content-global-config-basic-properties))_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-border-color.jpg)

### The Border Radius

It defines the `border-radius` CSS value.

- **Config Property:** `borderRadius`.
- **Type:** `number`.
- **Default:** `4` (same for each corner).
- **Translated to:** _pixels_.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-border-radius.jpg)

### The Max Width

It defines the maximum width allowed for the tooltip.

- **Config Property:** `maxWidth`.
- **Type:** `string`.
- **Default:** `'200px'`.
- **You can use:** `px`, `em`, `%`, etc.

### The Class Names

It defines custom class names for your tooltip element.

- **Config Property:** `className`.
- **Type:** `string` or `string[]`.
- **Default:** _unset_.

### Use Animate

To establish wether to use a small CSS animation when show/hide the tooltip.

- **Config Property:** `animate`.
- **Type:** `boolean`.
- **Default:** `true`.

### Use Prevail

To establish wether the tooltip will prevail open when the user hovers over it.

> **NOTE:** The WCAG 2.1/2.2 - Criteria 1.4.13: Content on Hover or Focus, establishes under the "Hoverable" principle that: _The pointer can move over the new content without it disappearing._

- **Config Property:** `prevail`.
- **Type:** `boolean`.
- **Default:** `true`.

### Use As Label

To establish the same tooltip's text as the actual label to its trigger.

It will add an `aria-label` attribute with the same text.

- **Config Property:** `asLabel`.
- **Type:** `boolean`.
- **Default:** `false`.

> **NOTE:** Not all HTML elements are allowed to use `aria-label`, so in case the trigger does not allow it, a visually hidden text will be added after it, to keep the text within the content at all times and be reachable to all assistive technologies (such as Screen Readers).

### Toggle On

To establish which keys are allowed to toggle the tooltip's visibility.

- **Config Property:** `toggleOn`.
- **Type:** `string[]`.
- **From:** `KeyboardEvent.code`.
- **Default:** `['ControlLeft', 'ControlRight']`.

## The `recalculate()` Method

To recalculate the tooltip's position on demand.

This can come handy when we face scenarios where the trigger element can move after an interaction (like, by clicking on it) and it changes its original position. The tooltip doesn't know its trigger moved, so we have to force to recalculate by using this method.

A bit forced example: let's say we have a calendar with the typical "Previous Month" and "Next Month" buttons, with the current month in between, and all centered in the screen. Unless that current month's wrapper has a fixed width, it will change its size and, therefore, the buttons will change their positions.

To access the tooltip, we can use the exported instance from `a11yTooltip`:

**TypeScript:**

```typescript
currentMonth: number = 0;
readonly months: string[] = [
    'January', 'February', 'March', 'April', 'May', 'June', 'July',
    'August', 'September', 'October', 'November', 'December'
];

changeMonth(monthToAdd: number): void {
    const newMonth: number = this.currentMonth + monthToAdd;
    if (monthToAdd === -1 && newMonth < 0) this.currentMonth = 11;
    else if (newMonth > 11) this.currentMonth = 0;
    else this.currentMonth = newMonth;
}
```

**Template:**

```html
<button
    type="button"
    class="btn"
    tooltip="Previous Month"
    [tooltipConfig]="{ asLabel: true }"
    #ttPrev="a11yTooltip"
    (click)="changeMonth(-1); ttPrev.recalculate()">
    <i class="fa-solid fa-chevron-left"></i>
</button>
<div>{{ months[currentMonth] }}</div>
<button
    type="button"
    class="btn"
    tooltip="Next Month"
    [tooltipConfig]="{ asLabel: true }"
    #ttNext="a11yTooltip"
    (click)="changeMonth(1); ttNext.recalculate()">
    <i class="fa-solid fa-chevron-right"></i>
</button>
```

By default, the tooltip will stay where it was, being now misaligned from its trigger as you can see in the next example at the left, while the one at the right did recalculate its position and is perfectly aligned to the button.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-recalculate.jpg)

## The Color Schemes

This library uses [Color Scheme package](https://www.npmjs.com/package/@a11y-ngx/color-scheme) as a dependency so you can make use of the two basic color schemes: `light` and `dark` (or more).

### How to Configure the Color Schemes

You can establish all the color related stuff for the preset schemes (`light` and `dark`) or any other you may have added when using the `rootConfig()` method from `A11yColorSchemeModule`.

- **Config Property:** `colorSchemes`.
- **Type:** `ColorSchemesStyles`.
- **Properties:**
  - `schemes` of type `ColorSchemes`:
    - In here we have to specify each color scheme by its code-name and, within, the properties we want to override (of type `ColorSchemeProperties`):
      - `light`.
      - `dark`.
      - _'code-name'_ (any other).

Let's say you don't like the default text color for the `light` scheme (`#222`), then you can change it like this:

```typescript
A11yTooltipModule.rootConfig({
    ...
    safeSpace: { top: 65, left: 50 },
    borderSize: 2,
    ...
    colorSchemes: {
        schemes: {
            light: {
                textColor: '#000',
            },
            dark: {...},
            'red-velvet': {...}, // being 'red-velvet' the code-name
        },
    },
}),
```

> **NOTES:**
>
> 1. Although `colorSchemes` also includes the `generics` object to define (redundant as it may sound) the generic values (not related to color), that property was removed from here, and you can add those at the _root_ level of the object provided, as shown for the `borderSize` property.
> 2. If you add a color-related property at the _root_ level, it will be treated as _generic_ and will affect all tooltips.

### How to Force a Scheme

Even when the color scheme is set to a specific value (globally), you can force a tooltip to use another.

- **Config Property:** `forceScheme`.
- **Type:** `ColorScheme` (aka `string`, aka _'code-name'_).

I've added a couple color schemes for testing purposes, called `'red-velvet'` and `'blue-sky'`.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-force-scheme.jpg)

### How to add a New Color Scheme

Since Color Scheme package is a dependency, you can add new schemes if you need to. You can use the `rootConfig()` method on the `A11yColorSchemeModule` in your app.

The properties you can configure within the `scheme` object are:

- `a11yBackgroundColor`
- `a11yTextColor`
- `a11yBorderColor`
- `a11yShadow`
- `a11yShadowColor`

> **NOTE:** Any property you don't specify, it will use the value defined within `light`.

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

## The Use of Bootstrap Styles

Whether the tooltip will use Bootstrap 5.3 (or above) styles (if set to `true`) or preset/custom (if set to `false`).

> 😅 **NOTE:** You have to have Bootstrap installed on your app for this to work as expected, duh!

- **Config Property:** `useBootstrapStyles`.
- **Type:** `boolean`.
- **Default:** `false`.

> **NOTE:** If you choose to use Bootstrap:
>
> 1. The [Tooltip styles](https://getbootstrap.com/docs/5.3/components/tooltips/) are going to be applied.
> 2. **IMPORTANT:** Everything related to color is managed by Bootstrap, even if you have different schemes configured, you only have `light` and `dark` available.

In the example below:

- The left one doesn't have the property, so it will use the preset styles.
- The right one has `useBootstrapStyles` set with `true` (as seen in the code), so it's using Bootstrap's (font size, color, border color, border radius, etc.).

```html
...
<button
    type="button"
    class="btn"
    tooltip="Next Month"
    [tooltipConfig]="{ asLabel: true, useBootstrapStyles: true }">
    <i class="fa-solid fa-chevron-right"></i>
</button>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-use-bootstrap.jpg)

## The Use with Image Maps

Image maps can also be a "problem":

❌ The `<area>` elements have no "surface" like a normal element<br />
❌ If the image has been resized after the map was generated (based on its original size, duh!), events like hover and focus will no longer match

For the next example, we are working with an image with an original size of 1344px x 768px, downsized to 700px width.

```html
<img src="/assets/images/desktop-map-image.png" alt="" usemap="#image-map" width="700" />

<map name="image-map">
    <area tooltip="Monitor" shape="poly" coords="322,114,359,370,684,339,1030,367,1064,115,687,84" href="..."/>
    <area tooltip="Laptop" shape="poly" coords="17,338,75,527,117,649,417,542,350,436,302,262" href="..." />
    <area tooltip="Keyboard" shape="poly" coords="485,480,466,627,915,624,887,478" href="..." />
    <area tooltip="Mouse" shape="rect" coords="937,490,1035,590" href="..." />
    <area tooltip="Phone" shape="poly" coords="1119,418,1151,320,1201,338,1168,440" href="..." />
</map>
```

As seen in the next screenshot, there are two issues:

- The _beautiful_ (for visual purpose) red square is the focus ring for the monitor (since the coordinates of the polygon were genrated for its original size), so the focused element is respecting _that_ size
- The tooltip has no "surface" to attach to, so it's kind of "floating around"

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-image-map-off.jpg)

To fix this, you can make use of the [Responsive Image Maps library](https://www.npmjs.com/package/@a11y-ngx/responsive-image-maps) (if you have Image Maps in your website, of course).

✔️ It will readjust the coordinates for each `<area>` element to the current image size<br />
✔️ The tooltip will make use of the new coordinates to position itself properly

```typescript
import { A11yTooltipModule } from '@a11y-ngx/tooltip';
import { A11yResponsiveImageMapsModule } from '@a11y-ngx/responsive-image-maps';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yTooltipModule,
        A11yResponsiveImageMapsModule,
    ],
})
export class MyCustomModule { }
```

Now, we can observe that:

✔️ The focus ring matches the original coordinates in the new downsized image<br />
✔️ The tooltip is correctly located to its default position/alignment (top-center)

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-image-map-on.jpg)

## The Use with Abbreviation Elements

Abbreviations (`<abbr>`) are one of the few elements where using the native `title` attribute is both expected and "accessible".

While this is semantically correct, screen readers (as far as I know, all of them) won't read the title at all, that's why the library will add a visually hidden text after the `<abbr>`.

**Template:**

```html
Good <abbr title="User Experience">UX</abbr> design focuses on how a product feels,
while <abbr title="User Interface">UI</abbr> design focuses on how it looks.
Both are essential to creating intuitive digital experiences.
```

**Result for the Tooltip:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-abbr.jpg)

**Result for the NVDA Screen Reader:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-abbr-screen-reader.jpg)

## The Use with Non-Interactive Elements

In case you are using the tooltip in a non-interactive element (not recommended), the same thing will happen as with the use of the `<abbr>` element, it will add a visually hidden text after it.

**Template:**

```html
You can use any of the available alignments:
<i class="fa-solid fa-align-right" tooltip="Left"></i>,
<i class="fa-solid fa-align-center" tooltip="Center"></i>,
<i class="fa-solid fa-align-right" tooltip="Right"></i> or
<i class="fa-solid fa-align-justify" tooltip="Justified"></i>.
```

**Result for the Tooltip:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-non-interactive.jpg)

**Result for the NVDA Screen Reader:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/tooltip/src/lib/images/example-non-interactive-screen-reader.jpg)

> **IMPORTANT:** Remember that this is **NOT** recommended, since keyboard users can't reach the tooltip at all. Making the element focusable (`tabindex="0"`) might seem to "fix" the keyboard scenario, but it's **NOT** accessible, since users expect that focusable elements to be interactive.
