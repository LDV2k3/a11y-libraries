# Menu

An accessible Menu library for Angular with full keyboard navigation, correct ARIA semantics, screen-reader support and ready-to-use base styles.

It's built with WCAG 2.1/2.2 AA compliance in mind:

✔️ WAI-ARIA Authoring Practices compliant<br />
✔️ Full keyboard navigation (Arrows, Home/End, Enter, Space, Escape), mouse and touch interaction<br />
✔️ Full screen reader support<br />
✔️ Proper ARIA roles and states<br />
✔️ Correct focus management<br />
✔️ Normal actions, groups of radios or checkboxes, submenus and info items<br />
✔️ Color contrast ratio of at least 4.5:1 for the basic themes availables (`'light'` and `'dark'`)<br />

> ⚠️ This library implements an **Application Menu** (designed for executing actions, toggling states, and triggering commands). It behaves like a desktop software menu.
>
> 🛑 It is **not** a navigation menu. If your goal is simply to route users across different pages of your website, use a semantic HTML `<nav>` with standard links instead.

![Angular support from version 12 up to version 21](https://img.shields.io/badge/Angular-v12_to_v21-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v21.

## Changelog

See the complete [changelog](https://github.com/LDV2k3/a11y-libraries/blob/master/projects/a11y-ngx/menu/CHANGELOG.md) for details on updates and breaking changes.

## Index

- [Installation](#installation)
- [What do you Want to Build?](#what-do-you-want-to-build)
  - [I Just Want to Use the Menu](#-i-just-want-to-use-the-menu)
  - [I Want to Build my own Custom Wrapper using the Menu Engine](#️-i-want-to-build-my-own-custom-wrapper-using-the-menu-engine)
- [Basic Usage: Using the Menu](#basic-usage-using-the-menu)
  - [Global Configuration](#global-configuration)
    - [The General Config](#the-general-config)
      - [The Menu Label](#the-menu-label)
      - [Show Group Labels](#show-group-labels)
      - [The Class Names](#the-class-names)
      - [Allow Navigate Disabled Items](#allow-navigate-disabled-items)
      - [The Throttle](#the-throttle)
      - [The Animation](#the-animation)
        - [The Animation Timeout](#the-animation-timeout)
      - [The Icon Default Strategy](#the-icon-default-strategy)
      - [The Icon Default Loader](#the-icon-default-loader)
    - [The Positioning & Layout Config](#the-positioning--layout-config)
      - [The Position](#the-position)
      - [Align Menu Items With Trigger](#align-menu-items-with-trigger)
      - [The Menu Offset](#the-menu-offset)
      - [The Submenu Offset](#the-submenu-offset)
      - [The Mobile Labels](#the-mobile-labels)
      - [The Custom Boundary](#the-custom-boundary)
      - [The Safe Space](#the-safe-space)
      - [The Max Width](#the-max-width)
      - [The Max Height](#the-max-height)
    - [The Theme Config](#the-theme-config)
      - [Ecosystem Global](#ecosystem-global-recommended)
      - [Menu Global](#menu-global)
      - [Instance Level](#instance-level)
    - [Styling Your Menu](#styling-your-menu)
  - [The Menu Items Array](#the-menu-items-array)
    - [The Items Types](#the-items-types)
      - [The Items Common Properties](#the-items-common-properties)
        - [The `label` Property](#the-label-property)
        - [The `value` Property](#the-value-property)
        - [The `icon` Property](#the-icon-property)
        - [The `disabled` Property](#the-disabled-property)
        - [The `className` Property](#the-classname-property)
        - [The `shortcut` Property](#the-shortcut-property)
        - [The `info` Property](#the-info-property)
        - [The `action` Property](#the-action-property)
        - [The `beforeChange` Property](#the-beforechange-property)
        - [The `checked` Property](#the-checked-property)
        - [The `submenu` Property](#the-submenu-property)
        - [The `separator` Property](#the-separator-property)
        - [The `closeOnSelect` Property](#the-closeonselect-property)
      - [The `MenuItemAction` Type](#the-menuitemaction-type)
      - [The `MenuItemSubmenu` Type](#the-menuitemsubmenu-type)
      - [The `MenuItemInfo` Type](#the-menuiteminfo-type)
      - [The `MenuItemSeparator` Type](#the-menuitemseparator-type)
      - [The `MenuItemSelectable` Type](#the-menuitemselectable-type)
      - [The `MenuGroup` Type](#the-menugroup-type)
        - [The Group Label](#the-group-label)
        - [The Group Type](#the-group-type)
        - [The Group Layout](#the-group-layout)
        - [The Group Icon](#the-group-icon)
        - [The Group Items](#the-group-items)
        - [The Group Item Layout](#the-group-item-layout)
        - [The Group Busy Scope](#the-group-busy-scope)
        - [The Items Label Position](#the-items-label-position)
        - [The Items Label Wrap](#the-items-label-wrap)
        - [The Items Justify](#the-items-justify)
        - [The Grid Columns](#the-grid-columns)
        - [The Items Flow](#the-items-flow)
  - [The Directive](#the-directive)
    - [The Directive Inputs](#the-directive-inputs)
      - [The `a11yMenu` Input](#the-a11ymenu-input)
      - [The `a11yMenuConfig` Input](#the-a11ymenuconfig-input)
      - [The `a11yIconTemplate` Input](#the-a11yicontemplate-input)
    - [The Directive Outputs](#the-directive-outputs)
      - [The `itemSelected` Output](#the-itemselected-output)
      - [The `menuOpened` Output](#the-menuopened-output)
      - [The `menuClosed` Output](#the-menuclosed-output)
  - [The Programmatic API](#the-programmatic-api)
    - [The Menu Context](#the-menu-context)
    - [The Item Context](#the-item-context)
- [Advanced Usage: Building a Custom Menu Wrapper](#advanced-usage-building-a-custom-menu-wrapper)
  - [Feature Configuration](#feature-configuration)
  - [The `MenuCustomConfig` Object](#the-menucustomconfig-object)
    - [The Selector](#the-selector)
    - [Close On Click Outside](#close-on-click-outside)
    - [Close On Tab](#close-on-tab)
    - [The Positions Allowed](#the-positions-allowed)
    - [Focus Item When Open](#focus-item-when-open)
  - [The Core Services](#the-core-services)
  - [Feature Example: Building a Context Menu](#feature-example-building-a-context-menu)
- [Mobile Experience](#mobile-experience)
- [Menu DOM Structure](#menu-dom-structure)
- [Examples](#examples)
  - [Basic Menu](#basic-menu)
  - [The Submenu](#the-submenu)
  - [Default Icons Setup](#default-icons-setup)
    - [With Images](#icons-setup-with-images)
    - [Via Content Projection](#icons-setup-via-content-projection)
    - [Via Component Inputs](#icons-setup-via-component-inputs)
    - [Via Local Template](#icons-setup-via-local-template)
  - [The Zoom Info Item](#the-zoom-info-item)
  - [Selectable Groups](#selectable-groups)
    - [Custom Color Picker](#custom-color-picker)
  - [The Busy State: Async Actions](#the-busy-state-async-actions)
    - [Default Animation & Dynamic Updates](#default-animation--dynamic-updates)
    - [Adding a Custom Loading Spinner](#adding-a-custom-loading-spinner)
    - [The Busy State In Selectable Groups](#the-busy-state-in-selectable-groups)

## Installation

1. Install npm package:

   `npm install @a11y-ngx/menu`

2. Import `A11yMenuModule` into your module or standalone component:

   ```typescript
   import { A11yMenuModule } from '@a11y-ngx/menu';
   
   @NgModule({
       declarations: [...],
       imports: [
           ...
           A11yMenuModule,
       ],
   })
   export class AppModule { }
   ```

## What do you Want to Build?

Depending on your goal, you only need to focus on specific parts of this documentation. Choose your path:

### 🚀 I Just Want to Use the Menu

You just want a ready-to-use, accessible dropdown menu in your application.

Go to [Basic Usage: Using the Menu](#basic-usage-using-the-menu).

### 🛠️ I Want to Build my own Custom Wrapper using the Menu Engine

You are building a `MenuBar`, a `ContextMenu`, or any other complex UI wrapper and need isolated configurations.

Go to [Advanced Usage: Building a Custom Menu Wrapper](#advanced-usage-building-a-custom-menu-wrapper).

## Basic Usage: Using the Menu

To use the menu, you only need three things:

1. [Set up your global config](#global-configuration)
2. [Create your menu items array](#the-menu-items-array)
3. [Apply the `a11yMenu` directive to your trigger](#the-directive)

> ✨ [Check the examples](#examples)

### Global Configuration

Use the module's `rootConfig()` method or `provideA11yMenu()` to establish and override the global default configuration.

> ⚠️ **IMPORTANT: ❗❗ DO NOT use it on a library or a low level component within your app**, since this method is meant to be called **only once** at a root level on the **main app**.
>
> On a library or sub-module, check [How to Build a Custom Menu Wrapper section](#advanced-usage-building-a-custom-menu-wrapper).

**On Angular v12 - v14:**

```typescript
import { A11yMenuModule } from '@a11y-ngx/menu';

@NgModule({
    imports: [
        A11yMenuModule.rootConfig({
            maxWidth: '300px',
            offsetMenu: 5,
        }),
    ],
})
export class AppModule {}
```

**On Angular v15+:**

```typescript
import { provideA11yMenu } from '@a11y-ngx/menu';

export const appConfig: ApplicationConfig = {
    providers: [
        provideA11yMenu({
            maxWidth: '300px',
            offsetMenu: 5,
        }),
    ],
};
```

Accepts a single parameter `config` of type `MenuConfig`, which is composed of three main configuration groups:

- [The General Config](#the-general-config)
- [The Positioning & Layout Config](#the-positioning--layout-config)
- [The Theme Config](#the-theme-config)

#### The General Config

Defines the fundamental setup of the menu, including essential accessibility label, how the menu reacts to user interactions and default global strategy for icons.

| Property | Type | Default | Description |
| :------- | :--- | :-----: | :---------- |
| `menuLabel` | `string` | `undefined` | See [the Menu Label](#the-menu-label) |
| `showGroupLabels` | `boolean` | `true` | See [Show Group Labels](#show-group-labels) |
| `className` | `string` or `string[]` | `undefined` | See [the Class Names](#the-class-names) |
| `allowNavigateDisabled` | `boolean` | `true` | See [Allow Navigate Disabled Items](#allow-navigate-disabled-items) |
| `throttleMs` | `number` | `50` | See [the Throttle](#the-throttle) |
| `animate` | `MenuAnimate` | `'none'` | See [the Animation](#the-animation) |
| `animateMs` | `number` | `150` | See [the Animation Timeout](#the-animation-timeout) |
| `iconDefaultStrategy` | `IconDefaultComponent` or `'image'` | `undefined` | See [the Icon Default Strategy](#the-icon-default-strategy) |
| `iconDefaultLoader` | `MenuItemIcon` | `undefined` | See [the Icon Default Loader](#the-icon-default-loader) |
| `closeOnScrollOutside` | `boolean` | `true` | See [Close On Scroll Outside](#close-on-scroll-outside) |
| `closeOnWindowBlur` | `boolean` | `true` | See [Close On Window Blur](#close-on-window-blur) |

##### The Menu Label

Establishes the _root_ menu instance label.

> 💡 This value is not visible, it will serve the purpose and help only to screen reader users to have more context on what the menu is about.

- **Property:** `menuLabel`
- **Type:** `string`

##### Show Group Labels

Group labels are important to provide extra context on what the group is about.

When a group of stacked items is created and a label is assigned to it, that label will be visible above the items. This provides visual structure for sighted users, as well as spoken context for assistive technologies.

> Sometimes, a group of items is _visually_ self-explanatory thanks to its icons or proximity (e.g., **Bold**, **Italic**, and **Underline**).
>
> However, explicitly naming the group ensures that screen reader users don't just hear a _disconnected_ list of items. They will hear the exact same context that sighted users get from the layout.
>
> 💡 If your design requires not having a visible group label, strongly consider providing one anyway and use this property to visually hide it. This keeps it fully available for screen readers.

- **Property:** `showGroupLabels`
- **Type:** `boolean`
- **Default:** `true`

##### The Class Names

It defines custom class names for your element.

> **NOTE:** It can be applied to the menu, groups and menu items.
>
> 💡 Use it to apply specific styles or to override the [default design tokens](#styling-your-menu).

- **Property:** `className`
- **Type:** `string` or `string[]`

##### Allow Navigate Disabled Items

Allows navigate through disabled items.

> 💡 **NOTE:** By default, disabled items are part of the navigation, it doesn't mean they can be activated.

- **Property:** `allowNavigateDisabled`
- **Type:** `boolean`
- **Default:** `true`

##### The Throttle

Throttle to prevent rapid key-repeat events when the user holds a key.

- **Property:** `throttleMs`
- **Type:** `number`
- **Default:** `50`
- **Translated to:** _milliseconds_

##### The Animation

The animation for when the menu opens and closes (includes opacity by default).

- **Property:** `animate`
- **Type:** `MenuAnimate`
- **Default:** `'none'`

> 💡 You can establish a single option or an object specifying both (entry & exit) animations differently.
>
> When a single option is provided, it defines both, the 'entry' and 'exit' animations, with the same transition.
>
> **The options:**
>
> - `'top-bottom'` 👉 slides from top to bottom
> - `'bottom-top'` 👉 slides from bottom to top
> - `'left-right'` 👉 slides from left to right
> - `'right-left'` 👉 slides from right to left
> - `'scale-up'` 👉 scales from _small_ (0.9 ratio) to normal size
> - `'scale-down'` 👉 scales from _big_ (1.1 ratio) to normal size
> - `'none'`
>
> **Example:**
>
> ```typescript
> // When single option provided:
> animate: 'top-bottom' 👈 // will be the same for the entry and exit animations
> 
> // When object provided:
> animate: { in: 'top-bottom', out: 'scale-down' }
> ```

###### The Animation Timeout

The time for the animation to complete.

- **Property:** `animateMs`
- **Type:** `number`
- **Default:** `150`
- **Translated to:** _milliseconds_

##### The Icon Default Strategy

When it comes to icons, you might use standard images (local or external), a third-party library (like Material Icons) or your own custom component to render them.

In this property, you can define your preferred strategy: configure an image-based approach or provide _that_ component and its main entry method (_input_ or _content_).

- **Property:** `iconDefaultStrategy`
- **Type:**
  1. `'image'`: Defines that every icon will be rendered as an `<img>` tag.
  2. `IconDefaultComponent`: Defines that every icon will be rendered through _this_ component.

     | Property | Type | Description |
     | :------- | :--- | :---------- |
     | `component` | `Type<unknown>` | The main component to render the icons |
     | `mainEntry` | `'input'` or `'content'` | Defines whether the component uses an input or content projection for rendering |
     | `inputName` | `string` | To specify the input name when `mainEntry: 'input'` |
     | `inputs` | `Record<string, unknown>` | To provide any other inputs your component might need |

- **Examples:**
  - [Configure Images](#icons-setup-with-images)
  - Configure Components:
    - [Material Icons Component](#icons-setup-via-content-projection)
    - [Custom Icon Component](#icons-setup-via-component-inputs)

##### The Icon Default Loader

Defines a custom _loading_ icon.

> 💡 Whenever an item enters into a `busy` state (via the item's [`action`](#the-action-property) or [`beforeChange`](#the-beforechange-property) properties), the item's icon can automatically update to a specific loading icon using this property.

- **Property:** `iconDefaultLoader`
- **Type:** [`MenuItemIcon`](#the-icon-property)
- **Example:** [Adding a Custom Loading Spinner](#adding-a-custom-loading-spinner)

##### Close On Scroll Outside

Determines whether the menu should automatically close when the user scrolls outside of the menu container.

- **Property:** `closeOnScrollOutside`
- **Type:** `boolean`
- **Default:** `true`

##### Close On Window Blur

Determines whether the menu should close when the browser window loses focus (e.g., switching to another tab, clicking outside the browser or changing apps).

- **Property:** `closeOnWindowBlur`
- **Type:** `boolean`
- **Default:** `true`

#### The Positioning & Layout Config

Manages the spatial placement of the menu relative to its trigger and the viewport. It handles alignment logic, boundaries, offsets, and collision detection.

> **NOTE:** Some of the next properties comes from the [Overlay Base Library](https://www.npmjs.com/package/@a11y-ngx/overlay-base), who will handle the entire positioning for the menu.

| Property | Type | Default | Description |
| :------- | :--- | :------ | :---------- |
| `position` | `MenuPosition` | `'bottom-start'` | See [the Position](#the-position) |
| `alignMenuItemsWithTrigger` | `boolean` | `false` | See [Align Menu Items With Trigger](#align-menu-items-with-trigger) |
| `offsetMenu` | `number` | `2` | See [the Menu Offset](#the-menu-offset) |
| `offsetSubmenu` | `number` | `4` | See [the Submenu Offset](#the-submenu-offset) |
| `mobileLabels` | `MenuMobileLabels` | | See [the Mobile Labels](#the-mobile-labels) |
| `boundary` | `string` or `HTMLElement` | `<body>` | See [the Custom Boundary](#the-custom-boundary) |
| `safeSpace` | `OverlaySafeSpace` | `undefined` | See [the Safe Space](#the-safe-space) |
| `maxWidth` | `string` | `'auto'` | See [the Max Width](#the-max-width) |
| `maxHeight` | `string` | `'auto'` | See [the Max Height](#the-max-height) |

##### The Position

Establishes the position or position & alignment (hyphen separated) to open the menu.

- **Property:** `position`
- **Type:** `MenuPosition`
- **Default:** `'bottom-start'`

> 💡 For more information, please refer to the next links within the Overlay Base Library documentation:
>
> - [The Position Input](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-position-input)
>   - [The Overlay Position](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-overlay-position)
>   - [The Overlay Alignment](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-overlay-alignment)

##### Align Menu Items With Trigger

Aligns the menu _items_ (if `true`) or the menu's _side_ (if `false`) with the trigger.

> 💡 **NOTE:** Applies only for the root instance of the menu, not the submenus.

- **Property:** `alignMenuItemsWithTrigger`
- **Type:** `boolean`
- **Default:** `false`

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-root-align-items-with-trigger.jpg)

##### The Menu Offset

The space between the main trigger and the menu.

- **Property:** `offsetMenu`
- **Type:** `number`
- **Default:** `2`
- **Accepts:** positives and negatives
- **Translated to:** _pixels_

##### The Submenu Offset

The space between menu item and its submenu.

- **Property:** `offsetSubmenu`
- **Type:** `number`
- **Default:** `4`
- **Accepts:** positives and negatives
- **Translated to:** _pixels_

##### The Mobile Labels

Defines the text used for mobile navigation elements, such as the back button inside submenus and the main close button. These labels are essential for screen readers and mobile UX.

- **Property:** `mobileLabels`
- **Type:** `MenuMobileLabels`
- **Default:**

  ```typescript
  {
      back: 'Go back to previous menu',
      close: 'Close menu',
  }
  ```

> 💡 Check the [Mobile Experience section](#mobile-experience) to see and understand how the drawer works.

##### The Custom Boundary

A custom boundary can be interpreted as a wrapper/container. The menu will consider that boundary as the new limits for its positioning.

> **NOTE:** You can establish a string with the element's selector or an HTML element.

- **Property:** `boundary`
- **Type:** `string` or `HTMLElement`
- **Default:** `<body>`

> 💡 Please refer to the ["Custom Boundary" section in the Overlay Base Library](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-custom-boundary) for more details.

##### The Safe Space

To establish an extra safe space to the viewport's edges in case some fixed areas are present, such as headers, side menus or footers and you don't want the menu to overlap them.

This way, the menu will consider this area as the edge limit and reposition itself if reached.

- **Property:** `safeSpace`
- **Type:** `OverlaySafeSpace`
  - `object` with each side as a property of type `number`
- **Default:** `{ top: 0, bottom: 0, left: 0, right: 0 }`

> 💡 Please refer to the ["Safe Space" section in the Overlay Base Library](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-safe-space) for more details.

##### The Max Width

Defines the maximum width allowed for the menu.

- **Property:** `maxWidth`
- **Type:** `string`
- **Default:** `'auto'`

##### The Max Height

Defines the maximum height allowed for the menu.

- **Property:** `maxHeight`
- **Type:** `string`
- **Default:** `'auto'`

#### The Theme Config

Handles the theming behavior. If not provided, it defaults to the system's active color scheme.

You can configure the theme at three different levels:

- [Ecosystem Global (Recommended)](#ecosystem-global-recommended)
- [Menu Global](#menu-global)
- [Instance Level](#instance-level)

> 💡 **NOTE:** The configuration follows a strict priority cascade: **Instance** ➔ **Menu Global** ➔ **Ecosystem Global**.

**The Menu in Light mode:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-theme-light.jpg)

**The Menu in Dark mode:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-theme-dark.jpg)

##### Ecosystem Global (Recommended)

If you are using multiple `@a11y-ngx` libraries, you can set the theme once for the entire ecosystem using either the module or the provider. This prevents you from having to configure the theme individually for each library you install.

**On Angular v12 - v14:**

```typescript
import { A11yThemeModule } from '@a11y-ngx/theme';

@NgModule({
    imports: [
        A11yThemeModule.rootConfig('dark'),
    ],
})
export class AppModule {}
```

**On Angular v15+:**

```typescript
import { provideA11yTheme } from '@a11y-ngx/theme';

export const appConfig: ApplicationConfig = {
    providers: [
        provideA11yTheme('dark'),
    ],
};
```

##### Menu Global

You can configure the theme globally strictly for the Menu library. This will apply the theme to all menu instances in your app, overriding the Ecosystem configuration (if provided), without affecting other `@a11y-ngx` libraries.

- **Property:** `theme`
- **Type:** `'light'` or `'dark'`

> Provide it within [the configuration in `rootConfig()`](#global-configuration).

##### Instance Level

You can set the theme for a specific menu instance. This has the highest priority and will override any global configuration for that single menu. Useful for isolated cases.

- **Property:** `theme`
- **Type:** `'light'` or `'dark'`

> Provide it within [the configuration in the `a11yMenuConfig` input](#the-a11ymenuconfig-input).

#### Styling Your Menu

The library uses CSS Variables. This provides a cleaner, CSS-native way to customize colors, sizes, etc.

> 💡 **Need more specificity?** While CSS variables cover most use cases, if they aren't enough and you need to override internal elements, check the [Menu's DOM Structure](#menu-dom-structure) section to see exactly which attribute selectors you must use.

**Layout & Structure:**

| Variable | Default |
| :------- | :-----: |
| `--menu-zindex` | `9999` |
| `--menu-icon-size` | `20px` |
| `--menu-line-height` | `1.4` |
| `--menu-border-size` | `1px` |
| `--menu-border-radius` | `7px` |
| `--menu-padding` | `0.3rem` |
| `--menu-shadow` | `5px 5px 10px -5px` |
| `--menu-item-gap-size` | `15px` |
| `--menu-item-font-size` | `16px` |
| `--menu-item-border-radius` | `4px` |
| `--menu-item-padding-block` | `0.35rem` |
| `--menu-item-padding-inline` | `1rem` |
| `--menu-item-focus-size` | `2px` |
| `--menu-separator-border-size` | `1px` |
| `--menu-separator-block` | `0.25rem` |
| `--menu-separator-inline` | `0` |
| `--menu-tooltip-border-size` | `1px` |
| `--menu-panel-border-size` | `1px` |

**Colors:**

> 💡 **NOTE:** Most of the values shown below are fallbacks. The menu will automatically inherit the corresponding tokens from the [A11y Theme library](https://www.npmjs.com/package/@a11y-ngx/theme).

| Variable | Light | Dark |
| :------- | :---: | :--: |
| `--menu-bg-color` | `rgb(255 255 255 / 98%)` | `rgb(31 31 31 / 98%)` |
| `--menu-border-color` | `#656565` | `#666` |
| `--menu-shadow-color` | `#444` | `#444` |
| `--menu-item-bg-color` | `transparent` | `transparent` |
| `--menu-item-text-color` | `#222` | `#fff` |
| `--menu-item-hover-bg-color` | `#ddd` | `#393939` |
| `--menu-item-hover-text-color` | `#222` | `#fff` |
| `--menu-item-disabled-bg-color` | `transparent` | `transparent` |
| `--menu-item-disabled-text-color` | `#949494` | `#7a7a7a` |
| `--menu-item-disabled-hover-bg-color` | `#ddd` | `#393939` |
| `--menu-item-focus-color` | `#7d7d7d` | `#828282` |
| `--menu-shortcut-text-color` | `#5f5f5f` | `#bcbcbc` |
| `--menu-separator-border-color` | `#656565` | `#666` |
| `--menu-tooltip-bg-color` | `#ddd` | `#393939` |
| `--menu-tooltip-text-color` | `#222` | `#fff` |
| `--menu-tooltip-border-color` | `#7d7d7d` | `#828282` |
| `--menu-panel-bg-color` | `#e5e5e5` | `#333333` |
| `--menu-panel-text-color` | `currentColor` | `currentColor` |
| `--menu-panel-border-color` | `#9d9d9d` | `#6a6a6a` |

For testing purposes, we've added `'red-velvet'` as a class name for a single menu instance.

**Our CSS:**

```css
a11y-menu.red-velvet {
    --menu-bg-color: #590811;
    --menu-item-text-color: #ffeeee;
    --menu-item-hover-bg-color: #8d3939;
    --menu-shortcut-text-color: #efbbc1;
    --menu-border-color: #c99999;
    --menu-shadow-color: #995555;
    --menu-item-focus-color: #a4a4a4;
}
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-css-variables.jpg)

### The Menu Items Array

The menu accepts an array of type `Menu`, which can contain two main categories of elements: **Loose Items** and **Groups**. Understanding when to use each is key for good UX and Accessibility.

1. **Loose Items** (Standalone)<br>
    These are individual items rendered directly in the main list. They are standard options that do not share a specific semantic context with their neighbors.
    - **Accessibility Impact:** Screen readers will simply announce them one by one as regular menu items.
    - **When to use:** For general, unrelated actions (e.g., "Save", "Print", or open a submenu).
    - **Available types:** `Action`, `Submenu`, `Info`, `Separator`.

2. **Group of Items** (Contextual)<br>
   Groups are dedicated containers used to bundle closely related options together. Using a group instead of multiple loose items provides three massive benefits:
   - **Strict Cohesion:** A group strictly contains items of the _same type_:
     - A group of `Radio` items to select a theme.
     - A group of `Checkbox` items for text formatting.
     - A group of `Action` items, like "Cut", "Copy" and "Paste".
   - **Accessibility Context:** The library automatically wraps the collection in a `role="group"` container. This allows screen readers to announce the group's context before reading the items, giving blind users the exact same understanding that sighted users get from the visual layout.
   - **Smart UI (Auto-separators):** You don't need to manually push `Separator` items into your array. The menu engine automatically injects them before and after the group to neatly isolate it from the rest of the loose items and other groups.
   - **Available types:** `Action Group`, `Radio Group`, `Checkbox Group`.

#### The Items Types

- [`MenuItemAction`](#the-menuitemaction-type)
- [`MenuItemSubmenu`](#the-menuitemsubmenu-type)
- [`MenuItemInfo`](#the-menuiteminfo-type)
- [`MenuItemSeparator`](#the-menuitemseparator-type)
- [`MenuGroup`](#the-menugroup-type)
  - [`MenuItemSelectable`](#the-menuitemselectable-type)

##### The Items Common Properties

✅ Full support | ☑️ Partial support (depends on config)

| Property | `Action` | `Selectable` | `Submenu` | `Info` | `Separator` | `Groups` |
| :------- | :------: | :----------: | :-------: | :----: | :---------: | :------: |
| [`label`](#the-label-property) | ✅ | ✅ | ✅ | - | - | ✅ |
| [`value`](#the-value-property) | ✅ | ✅ | ✅ | ✅ | - | - |
| [`icon`](#the-icon-property) | ✅ | ✅ | ✅ | ✅ | - | ☑️ |
| [`disabled`](#the-disabled-property) | ✅ | ✅ | ✅ | - | - | - |
| [`className`](#the-classname-property) | ✅ | ✅ | ✅ | ✅ | - | ✅ |
| [`shortcut`](#the-shortcut-property) | ✅ | ✅ | - | - | - | - |
| [`info`](#the-info-property) | - | - | - | ✅ | - | - |
| [`checked`](#the-checked-property) | - | ✅ | - | - | - | - |
| [`submenu`](#the-submenu-property) | - | - | ✅ | - | - | - |
| [`separator`](#the-separator-property) | - | - | - | - | ✅ | - |
| [`action`](#the-action-property) | ✅ | - | - | - | - | - |
| [`beforeChange`](#the-beforechange-property) | - | ✅ | - | - | - | ☑️ |
| [`closeOnSelect`](#the-closeonselect-property) | ✅ | ✅ | - | - | - | ✅ |

###### The `label` Property

The visible text displayed for the menu item.

- **Property:** `label` 🔴 _(mandatory)_
- **Type:** `string`
- **Accessibility:** Serves as the primary accessible name for `Action`, `Selectable` and `Submenu` items.
  - When `Submenu`, it also acts as the accessible label for the opened menu container (e.g.: announced as _"Share menu"_).
  - When `Group`, it provides the accessible name for the grouping container (e.g.: announced as _"Zoom grouping"_).
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type), [`MenuItemSubmenu`](#the-menuitemsubmenu-type) and [`MenuGroup`](#the-menugroup-type)

###### The `value` Property

A unique identifier for the menu item.

> 💡 Crucial for:
>
> - Better identify the item when emitted.
> - Retrieve the item through the [`menuContext`](#the-menu-context) when available.

- **Property:** `value` ⭕ _(optional)_
- **Type:** `string`
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type), [`MenuItemSubmenu`](#the-menuitemsubmenu-type) and [`MenuItemInfo`](#the-menuiteminfo-type)

###### The `icon` Property

The icon displayed alongside the item's label.

> 💡 **NOTE:** When at least one item in the menu has an icon defined, the rest of the items will have an empty placeholder to keep all text labels perfectly aligned.
>
> ⚠️ **EXCEPTION:** Items in "radio" or "checkbox" groups are excluded from this _visual alignment_, since they also have their own selection icons.
>
> <hr />
>
> 💡 **IMPORTANT:** This property overrides any global icon configuration for the specific menu item.
>
> For example, if you configured Material Icons globally, you can still use a different icon by:
>
> ```typescript
> // setting another component
> icon: {
>     component: AppIconComponent,
>     inputs: {
>         icon: 'fa-solid fa-star',
>     }
> }
> // or just a simple HTML
> icon: { html: '🌟' }
> // or just an image
> icon: { src: '/assets/images/menu/icon-star.png' }
> ```

- **Property:** `icon` ⭕ _(optional)_
- **Type:** `MenuItemIcon`
  - `string`:
    - 👉 When a global icon config exists, via [`a11yIconTemplate`](#the-a11yicontemplate-input) (directive) or [`iconDefaultStrategy`](#the-icon-default-strategy) (config), you can use this to provide **only** the string path (for `'image'`) or data/name to be injected into your template/component.

      > ```typescript
      > // Let's say you have defined `iconDefaultStrategy` within your main config with `MatIcon` component, then you can safely pass the icon name
      > icon: 'info',
      > // or you have defined `iconDefaultStrategy` with 'image', then you can pass the image's path
      > icon: '/assets/images/menu/icon-info.png',
      > // or you have passed your own template through `a11yIconTemplate` input, which will use the string as the class names
      > icon: 'fa-solid fa-info',
      > ```

    - 👉 When **NO** global config is defined, use this to provide the raw HTML snippet directly.

      > ```typescript
      > icon: '<i class="fa-solid fa-info"></i>',
      > ```

  - `IconInputHTML`: 👉 Use this to render a raw HTML snippet.

    > ```typescript
    > icon: { html: '<i class="fa-solid fa-info"></i>' },
    > ```

  - `IconInputImage`: 👉 Use this to render an image from your assets folder or an external URL.

    > ```typescript
    > icon: { src: '/assets/images/menu/icon-info.png' },
    > ```

  - `IconInputComponent`: 👉 Use this to dynamically render an Angular Component.
   Perfect for libraries like Angular Material (or your own icon component).

    > ```typescript
    > icon: { component: MatIcon, content: 'info' },
    > ```

  - `IconInputTemplate` (aka `TemplateRef<unknown>`): 👉 Use this to pass an `<ng-template>` directly from your HTML view
   for complete structural control.

    > ```typescript
    > icon: this.myIconTemplateRef,
    > ```

- **Accessibility:** Icons are ignored completely.
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type), [`MenuItemSubmenu`](#the-menuitemsubmenu-type), [`MenuItemInfo`](#the-menuiteminfo-type) and [`MenuGroup`](#the-menugroup-type) (when group layout is `'inline'`)
- **Examples:**
  - [Using Images](#icons-setup-with-images)
  - [Using Component with Content Projection](#icons-setup-via-content-projection) (e.g., Material Icons)
  - [Using Component with Inputs](#icons-setup-via-component-inputs) (e.g., Lucide, Heroicons, Custom)
  - [Using Local Template](#icons-setup-via-local-template)

###### The `disabled` Property

Defines whether the item is disabled or not, preventing user interaction and skipping it during navigation **only when [`allowNavigateDisabled`](#allow-navigate-disabled-items) is set to `false`**.

- **Property:** `disabled` ⭕ _(optional)_
- **Type:** `boolean`
- **Accessibility:** Applies the `aria-disabled="true"` attribute to provide the right state context for assistive technologies.
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type) and [`MenuItemSubmenu`](#the-menuitemsubmenu-type)

###### The `className` Property

Defines custom class names for your element.

- **Property:** `className` ⭕ _(optional)_
- **Type:** `string` or `string[]`
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type), [`MenuItemSubmenu`](#the-menuitemsubmenu-type), [`MenuItemInfo`](#the-menuiteminfo-type) and [`MenuGroup`](#the-menugroup-type)

###### The `shortcut` Property

Displays a keyboard shortcut combination next to the item's label.

> 💡 **NOTE:** This property is purely for visual and a11y purposes. The menu does not automatically bind these keystrokes to trigger the item's action. You must handle the actual keyboard event listeners separately in your code.

- **Property:** `shortcut` ⭕ _(optional)_
- **Type:** `MenuItemShortcut`
- **Properties:**

  | Property | Type | Mandatory | Description |
  | :------- | :--- | :-------: | :---------- |
  | `key` | `string` | ✔️ Yes | The primary key (e.g., 'S', 'P', 'Enter', 'Del') |
  | `keyLabel` | `string` | ❌ No | Full word for screen readers (e.g., 'Delete' when the `key` is 'Del') |
  | `ctrlCmd` | `boolean` | ❌ No | Requires 'Ctrl' (Win/Linux) or 'Cmd / ⌘' (Mac) |
  | `alt` | `boolean` | ❌ No | Requires 'Alt' (Win/Linux) or 'Option / ⌥' (Mac) |
  | `shift` | `boolean` | ❌ No | Requires 'Shift / ⇧' |

- **Accessibility:** Automatically generates the `aria-keyshortcuts` attribute. The `keyLabel` property is a powerful addition to provide a screen-reader-friendly pronunciation for abbreviated keys (e.g., rendering "Ctrl+Del" visually, but announcing "Control+Delete").
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type) and [`MenuItemSelectable`](#the-menuitemselectable-type).
- **Example:**
  > **Typescript:**
  >
  > ```typescript
  > shortcut: { ctrlCmd: true, key: 'N' },
  > ```
  >
  > **Will Render As:**
  >
  > ```html
  > <!-- On Windows/Linux -->
  > <a11y-menu-item aria-keyshortcuts="Ctrl+N" menu-item>
  >     ...
  >     <span menu-item-shortcut>Ctrl+N</span>
  > </a11y-menu-item>
  >
  > <!-- On Mac -->
  > <a11y-menu-item aria-keyshortcuts="Meta+N" menu-item>
  >     ...
  >     <span menu-item-shortcut>⌘N</span>
  > </a11y-menu-item>
  > ```
  >
  > **Result:**
  >
  > ![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-shortcuts.jpg)

###### The `info` Property

Used to display read-only, informational text. It does not trigger actions or selections.

> 💡 **NOTE:** If your intention is to provide relevant information that _visually_ changes, strongly consider using the `announce()` method to also provide the updated context to assistive technologies. Check the list of examples below.

- **Property:** `info` 🔴 _(mandatory)_
- **Type:** `string`
- **Accessibility:** Informational texts are ignored completely
- **Applies to:** [`MenuItemInfo`](#the-menuiteminfo-type)
- **Examples:**
  - [The Zoom Info Item](#the-zoom-info-item)
  - [Default Animation & Dynamic Updates](#default-animation--dynamic-updates)

###### The `action` Property

Executes a custom callback function when the item is clicked or activated via keyboard.

> 💡 **NOTE:** When a custom `action` method is defined, the menu **will not** emit the selected item through the default directive/component emitter. The execution flow is entirely delegated to your custom function.

- **Property:** `action` ⭕ _(optional)_
- **Type:** `(itemCtx: MenuItemContext, menuCtx: MenuContext) => void`
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type)
- **Example:** [The Zoom Info Item](#the-zoom-info-item)

> See also [the `MenuItemContext`](#the-item-context) and [the `MenuContext`](#the-menu-context).

###### The `beforeChange` Property

A guard function that intercepts a selection change (for `'checkbox'` or `'radio'` groups only) before allowing or aborting the state update.

It is the perfect place to handle asynchronous validations, API calls, or conditional business logic.

After validating whatever you have to, return `true` to allow the state to change, or `false` to abort it.

> 💡 **NOTE:** If your function returns a `Promise` or an `Observable`, the menu will automatically place the item into a non-interactive `busy` state (preventing duplicate clicks and showing a _pulse_ animation and a loading indicator (see [the `iconDefaultLoader`](#the-icon-default-loader))) until the operation resolves.
>
> 💡 **NOTE 2:** When a custom `beforeChange` method is defined, the menu **will not** emit the selected item through the default directive/component emitter. The execution flow is entirely delegated to your custom function.
>
> 💪 When a `'radio'` item gets selected, all the items within the group will enter into the same `busy` state, to prevent race conditions. For `'checkbox'` groups, this scope is configurable via [the `busyScope` property](#the-group-busy-scope).

- **Property:** `beforeChange` ⭕ _(optional)_
- **Type:** `(itemCtx: MenuItemContext, menuCtx: MenuContext, newState: boolean) => void | boolean | Promise<boolean> | Observable<boolean>`
  - **The Return Types:**
    - `void`: No need to return anything, it will be auto interpreted as `true` by default, allowing the state change.

      > ```typescript
      > beforeChange: (itemCtx, menuCtx, newState) => {
      >     this.allowChangeColors = newState;
      > }
      > ```

    - `boolean`: To validate things manually, return a `boolean` to allow or cancel the state change.

      > ```typescript
      > beforeChange: (itemCtx, menuCtx, newState) => {
      >     return this.allowChangeColors;
      > }
      > ```

    - `Promise<boolean>` or `Observable<boolean>`: To validate things asynchronously.

      > ```typescript
      > beforeChange: async (itemCtx, menuCtx, newState) => {
      >     return await this.myService.validateSelection(itemCtx.item.value, newState);
      > }
      > ```

- **Applies to:** [`MenuItemSelectable`](#the-menuitemselectable-type) and [`MenuGroup`](#the-menugroup-type) (when group type is `'radio'` or `'checkbox'`)

> See also [the `MenuItemContext`](#the-item-context) and [the `MenuContext`](#the-menu-context).

###### The `checked` Property

Determines the current selection state of a selectable item (for `'checkbox'` or `'radio'` items).

When set to `true`, the item renders its active visual state (e.g., a checkmark or a filled radio circle).

> 🔄 See also [the Group Type](#the-group-type) to understand the **Internal State Management**.
>
> ⚠️ **NOTE:** While the menu handles state updates automatically after interaction, it **does not pre-validate** your initial configuration. If you provide a radio group with multiple checked items, the menu will render them exactly as provided.

- **Property:** `checked` ⭕ _(optional)_
- **Type:** `boolean`
- **Accessibility:** Automatically applies and toggles the `aria-checked` attribute between `"true"` or `"false"` to keep assistive technologies perfectly synced with the visual state.
- **Applies to:** [`MenuItemSelectable`](#the-menuitemselectable-type)

###### The `submenu` Property

Establishes the items for the submenu.

- **Property:** `submenu` 🔴 _(mandatory)_
- **Type:** [`Menu`](#the-menu-items-array)
- **Accessibility:** Automatically applies `aria-haspopup="menu"` and toggles the `aria-expanded` attribute between `"true"` or `"false"` to keep assistive technologies perfectly synced with the visual state.
- **Example:** [The Submenu](#the-submenu)

###### The `separator` Property

Used to separate menu items into logical sections and improve visual hierarchy.

> **NOTE:** 💡 When you create groups, separators are automatically added before and after.
>
> ✔️ You can use them when:
>
> - They are among _loose_ items (not grouped).
> - They are within a group of type `'common'` and item's layout is either `'stack'` or `'inline'`.
>
> ❌ You **can't** use them within a group of type `'checkbox'`, `'radio'` or when item's layout is `'grid'`.
>
> ℹ️ By default, separators are horizontal; on the `'inline'` item's layout they become vertical.

- **Property:** `separator` 🔴 _(mandatory)_
- **Type:** `boolean`
- **Accessibility:** Automatically applies the `role="separator"` and `aria-orientation` attributes.
- **Applies to:** [`MenuItemSeparator`](#the-menuitemseparator-type).

###### The `closeOnSelect` Property

Determines whether the menu should automatically close after the user interacts with the item.

> 💡 **NOTE:** You can define this property at the `MenuGroup` level to apply it to all its children. However, if an individual item defines its own `closeOnSelect` value, it will safely override the group's configuration.

- **Property:** `closeOnSelect` ⭕ _(optional)_
- **Type:** `boolean`
- **Default:**
  - `true` for _action_ items (whether _loose_ or within a group).
  - `false` for groups with _selectable_ items (`'checkbox'` or `'radio'`), allowing multiple selections without having to reopen the menu.
- **Applies to:** [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemSelectable`](#the-menuitemselectable-type) and [`MenuGroup`](#the-menugroup-type).

##### The `MenuItemAction` Type

An **action** is a normal executable option.

- **Properties Allowed:** [`label`](#the-label-property), [`value`](#the-value-property), [`icon`](#the-icon-property), [`disabled`](#the-disabled-property), [`className`](#the-classname-property), [`shortcut`](#the-shortcut-property), [`action`](#the-action-property), [`closeOnSelect`](#the-closeonselect-property).

  > ```typescript
  > menu: Menu = [
  >     { label: 'Delete' },        // Action
  >     { label: 'Mark as read' },  // Action
  > ];
  > ```

##### The `MenuItemSubmenu` Type

A **submenu** is a menu that appears when you select or hover over a menu item that contains nested additional related options.

- **Properties Allowed:** [`label`](#the-label-property), [`value`](#the-value-property), [`icon`](#the-icon-property), [`submenu`](#the-submenu-property), [`disabled`](#the-disabled-property), [`className`](#the-classname-property).

  > ```typescript
  > menu: Menu = [
  >     ...,
  >     {
  >         label: 'Download',          // Submenu Label
  >         submenu: [                  // Submenu Items
  >             { label: 'As PDF' },    // Action
  >             { label: 'As Word' },   // Action
  >             { label: 'As Excel' },  // Action
  >             { label: 'As CSV' },    // Action
  >         ],
  >     },
  > ];
  > ```

##### The `MenuItemInfo` Type

An **info** item is just a non-interactive element used purely to display static text or metadata within the menu. It cannot be clicked, triggered, or toggled; is also skipped by standard keyboard navigation.

- **Properties Allowed:** [`info`](#the-info-property), [`value`](#the-value-property), [`icon`](#the-icon-property), [`className`](#the-classname-property).

  > ```typescript
  > menu: Menu = [
  >     ...,
  >     {
  >         label: 'Zoom',              // Group Label
  >         items: [                    // Group Items
  >             { label: 'Zoom Out' },  // Action
  >             { info: '100%' },       // Info
  >             { label: 'Zoom In' },   // Action
  >         ],
  >     },
  > ];
  > ```

> 💡 **Common use cases:**
>
> - **User Context:** Displaying the logged-in user's name or email at the top of a profile menu.
> - **Status & Metadata:** Showing application version numbers, connection status, or the "last synced" time.
> - **Helper Text:** Providing a brief read-only description or context for the surrounding options.

##### The `MenuItemSeparator` Type

A **separator** is to provide visually grouping context.

> 💡 **NOTE:** By default, separators are horizontal; on the `'inline'` item's layout they become vertical.

- **Properties Allowed:** [`separator`](#the-separator-property).

  > ```typescript
  > menu: Menu = [
  >     ...,
  >     { separator: true },  // Separator
  >     ...,
  > ];
  > ```

##### The `MenuItemSelectable` Type

A **selectable** item is a stateful element to toggle settings or select preferences.

> 💡 **NOTE:** Selectable items are only available for using within groups of type `'radio'` or `'checkbox'`.
>
> 🔄 See also [the Group Type](#the-group-type) to understand the **Internal State Management**.

- **Properties Allowed:** [`label`](#the-label-property), [`value`](#the-value-property), [`icon`](#the-icon-property), [`checked`](#the-checked-property), [`disabled`](#the-disabled-property), [`className`](#the-classname-property), [`shortcut`](#the-shortcut-property), [`beforeChange`](#the-beforechange-property), [`closeOnSelect`](#the-closeonselect-property).

  > ```typescript
  > menu: Menu = [
  >     ...,
  >     {
  >         type: 'checkbox',                        // Group Type
  >         label: 'Text Format',                    // Group Label
  >         items: [                                 // Group Items
  >             { label: 'Bold', checked: true },    // Selectable
  >             { label: 'Italic', checked: true },  // Selectable
  >             { label: 'Underline' },              // Selectable
  >         ],
  >     },
  >     ...,
  > ];
  > ```

##### The `MenuGroup` Type

As mentioned before, **groups** are _containers_ used to bundle closely related options together.

- **Properties Allowed:** [`label`](#the-group-label), [`type`](#the-group-type), [`icon`](#the-group-icon), [`layout`](#the-group-layout), [`items`](#the-group-items), [`itemsLayout`](#the-group-item-layout), [`busyScope`](#the-group-busy-scope), [`closeOnSelect`](#the-closeonselect-property), [`className`](#the-class-names).
- **Items Layouts:**
  - `'inline'`, also contains:
    - [`itemsLabelPosition`](#the-items-label-position)
    - [`itemsLabelWrap`](#the-items-label-wrap)
    - [`itemsJustify`](#the-items-justify)
  - `'grid'`, also contains:
    - [`columns`](#the-grid-columns)
    - [`itemsFlow`](#the-items-flow)
    - [`itemsLabelPosition`](#the-items-label-position)
    - [`itemsLabelWrap`](#the-items-label-wrap)

###### The Group Label

The accessible name for the group. It provides essential context to both, sighted and screen reader users, about the purpose of the grouped items.

- **Property:** `label`
- **Type:** `string`

> ‼️ It is **highly recommended** for groups to have a label, to provide the right context to the users.
>
> ✔️ Since the label takes _extra_ space in stacked layouts, your design might not allow showing them. For those cases you can use the `showLabel` property (`boolean`) and set it to `false`. Check the [Selectable Groups Example](#selectable-groups).
>
> 💡 You can change it at a global level using [`showGroupLabels`](#show-group-labels) within the module or menu instance configuration.
>
> **IMPORTANT:** Even if you set this to `false` to hide them visually, providing a `label` string is **crucial** to ensure screen reader accessibility.

###### The Group Type

Defines the type of items within the group.

- **Property:** `type`
- **Type:**
  - `'common'`: Action, Submenu, Info or Separator items.
  - `'radio'`: A mutually exclusive list of options where only one item can be selected at a time.
  - `'checkbox'`: A list of independent options where any number of items can be toggled on or off.
- **Default:** `'common'`

> 🔄 **Internal State Management**
>
> The menu engine automatically handles the `checked` state of your items under the hood. You only need to provide the **initial state** when defining the items array, and the library will take care of the rest.
>
> - **Checkbox Groups:** Each item's state is toggled independently.
> - **Radio Groups:** These are mutually exclusive. When a user selects a radio item, the library automatically deselects the previously checked item within that same group.
>
> ⚠️ **Important Note on Radio Initialization:**
> The library trusts the initial state you provide. If you mistakenly set `checked: true` on multiple items within the same Radio group, the engine will not throw an error or pre-validate it, but it will result in an invalid UI state (multiple active radios) until the user interacts with the group and the internal state corrects itself.

###### The Group Layout

Establishes the disposition between icon, label and the list of items.

- **Property:** `layout`
- **Type:** `'stack'` or `'inline'`
- **Default:** `'stack'`

**Stacked layout**: Vertical alignment

The label (if any) will be placed above the list of items (it does **not** allow adding a group icon).

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-stacked.jpg)

**Inline layout**: Horizontal alignment (side by side)

> **NOTE:** Inline layouts only accept `'inline'` or `'grid'` list of items.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-inline.jpg)

###### The Group Icon

The icon displayed alongside the group's label.

> 💡 **NOTE:** Icons are only available within groups with `'inline'` layouts, to maintain alignment with the rest of the menu items.
>
> ![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-inline-aligned.jpg)
>
> 🔍 Please, read more in [the `icon` property section](#the-icon-property).

###### The Group Items

An array containing the actual elements of the group. To ensure consistency and accessibility, the allowed item types **strictly depend** on [the group's `type` property](#the-group-type).

> ‼️ You cannot mix different elements (like radios and standard actions) within the same group context.

- **Property:** `items`
- **Group Type:**
  - `'common'` 👉 Array of [`MenuItemSubmenu`](#the-menuitemsubmenu-type), [`MenuItemAction`](#the-menuitemaction-type), [`MenuItemInfo`](#the-menuiteminfo-type) and [`MenuItemSeparator`](#the-menuitemseparator-type)
  - `'checkbox'` 👉 Array of [`MenuItemSelectable`](#the-menuitemselectable-type)
  - `'radio'` 👉 Array of [`MenuItemSelectable`](#the-menuitemselectable-type)

###### The Group Item Layout

Establishes the disposition for the list of items.

- **Property:** `itemsLayout`
- **Type:** `'stack'`, `'inline'` or `'grid'`
- **Default:** `'stack'`

**Stacked items layout:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-stacked.jpg)

**Inline items layout:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline.jpg)

**Grid items layout:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid.jpg)

###### The Group Busy Scope

Defines the scope of the _busy_ state when an item within a selectable group executes an asynchronous action.

- **Property:** `busyScope`
- **Type:** `'item'` or `'group'`
- **Default:**
  - `'item'` for checkbox groups.
  - `'group'` for radio groups.
  > 💡 **IMPORTANT:**
  >
  > To enforce mutual exclusivity, radio groups **mandatorily** lock the entire group while an item is processing. Using `'item'` in a radio group will be completely ignored.
  >
  > Checkbox groups use `'item'` by default, allowing multiple selections at the same time. However, you can set it to `'group'` if your application requires locking all options until the current action resolves.

###### The Items Label Position

Controls where the text label is positioned relative to the item's icon.

> ⚠️ **NOTE:** This property is specifically designed for groups with `'inline'` or `'grid'` item layouts.

- **Property:** `itemsLabelPosition`
- **Type:**
  - For both, `'inline'` and `'grid'` layouts:
    - `'below'`: Stacked vertically (icon on top, label on the bottom).
    - `'start'`: Label on the left, icon on the right.
    - `'end'`: Icon on the left, label on the right.
    - `'tooltip'`: Visually hides the text inside the item and displays it as an accessible tooltip on hover or keyboard navigation. 💡 Ideal for compact, icon-only designs (like a toolbar).
  - **Exclusive** to `'grid'` layouts:
    > 💡 In dense icon-only grids, regular tooltips can cover nearby items while navigating. So, you can choose between a:
    - **Static Panel**: Renders a fixed bar at the top or bottom of the grid.
      - `'panel-above'`
      - `'panel-below'`
    - **Floating Tooltip**: Displays a centered, hovering tooltip above or below the grid.
      - `'floating-above'`
      - `'floating-below'`
- **Default:** `'below'`

**Example Label Below (default):**

```typescript
{
    label: 'Download',
    itemsLayout: 'inline',
    items: [
        { label: 'As PDF', icon: '...' },
        { label: 'As Word', icon: '...' },
        { label: 'As Excel', icon: '...' },
        { label: 'As CSV', icon: '...' },
    ],
},
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline.jpg)

**Example Label End:**

```typescript
{ ..., itemsLabelPosition: 'end' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-label-end.jpg)

**Example Label Start:**

```typescript
{ ..., itemsLabelPosition: 'start' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-label-start.jpg)

**Example Label Tooltip:**

```typescript
{ ..., itemsLabelPosition: 'tooltip' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-label-tooltip.jpg)

**Example Label Panel Above:**

```typescript
{ ..., itemsLayout: 'grid', itemsLabelPosition: 'panel-above' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-panel-above.jpg)

**Example Label Panel Below:**

```typescript
{ ..., itemsLayout: 'grid', itemsLabelPosition: 'panel-below' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-panel-below.jpg)

**Example Label Floating Tooltip Above:**

```typescript
{ ..., itemsLayout: 'grid', itemsLabelPosition: 'floating-above' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-floating-tooltip-above.jpg)

**Example Label Floating Tooltip Below:**

```typescript
{ ..., itemsLayout: 'grid', itemsLabelPosition: 'floating-below' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-floating-tooltip-below.jpg)

###### The Items Label Wrap

Controls how the group items handles long labels.

> ⚠️ **NOTE:** This property is specifically designed for groups with `'inline'` or `'grid'` item layouts.

- **Property:** `itemsLabelWrap`
- **Type:** `boolean`
  - `true`: Allows the text to wrap onto multiple lines.
  - `false`: Keeps the label strictly on a single line.
- **Default:** `true`

> ℹ️ **NOTE 2:** The menu's overall width is automatically calculated based on its entire content.
>
> 💡 If for any reason some of your _inline_ or _grid_ item labels are wrapping and breaking the visual, you can set this option to `false` for that specific group.
>
> ✔️ Consider using the default stacked layout if their labels are long.

###### The Items Justify

Controls the horizontal alignment and distribution of items.

This is particularly useful when the menu's overall width is dictated by other wider items or groups, leaving empty horizontal space around your compact (e.g., icon-only) groups.

> ⚠️ **NOTE:** This property is specifically designed for groups with `'inline'` item layouts.

- **Property:** `itemsJustify`
- **Type:**
  - `'start'`: Aligns the items to the left side.
  - `'end'`: Aligns the items to the right side.
  - `'space-between'`: Distributes the items evenly across the available width.
- **Default:** `'start'`

**Example Items Justify Start (default):**

```typescript
{ 
    label: 'Zoom',
    itemsLayout: 'inline',
    items: [...],
},
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-justify-start.jpg)

**Example Items Justify End:**

```typescript
{ ..., itemsJustify: 'end' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-justify-end.jpg)

**Example Items Justify Space Between:**

```typescript
{ ..., itemsJustify: 'space-between' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-inline-justify-space-between.jpg)

###### The Grid Columns

Defines the number of columns to render the items.

> ⚠️ **NOTE:** This property is specifically designed for groups with `'grid'` item layouts.
>
> ❗❗❗ **IMPORTANT:** This property creates a strict layout. If your group has fewer items than the specified columns (e.g., setting `columns: 7` for only `2` items), the grid will maintain the full width of the 7-column structure, leaving visible empty spaces at the end of the row.

- **Property:** `columns`
- **Type:** `number`
- **Default:** `5`

**Example Grid with 5 Columns (default):**

```typescript
{
    itemsLayout: 'grid',
    label: 'Emoji',
    items: [...],
},
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-columns-five.jpg)

**Example Grid with 3 Columns:**

```typescript
{ ..., columns: 3 },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-columns-three.jpg)

###### The Items Flow

Controls how items are ordered inside a `'grid'` layout. Since menu keyboard navigation is always sequential (using Up/Down arrows), this property defines the order in which items are rendered and focused.

> ⚠️ **NOTE:** This property is specifically designed for groups with `'grid'` item layouts.

- **Property:** `itemsFlow`
- **Type:**
  - `'row'`: Items flow horizontally. Pressing the `Down Arrow` moves focus from left to right, then down to the next row.

    > ```html
    > [ Item 1 ] [ Item 2 ] [ Item 3 ]
    > [ Item 4 ] [ Item 5 ]
    > ```

  - `'column'`: Items flow vertically. Pressing the `Down Arrow` moves focus from top to bottom, then right to the next column.

    > ```html
    > [ Item 1 ] [ Item 4 ]
    > [ Item 2 ] [ Item 5 ]
    > [ Item 3 ]
    > ```

- **Default:** `'row'`

**Example Items Flow Row (default):**

```typescript
{
    label: 'Share',
    itemsLayout: 'grid',
    itemsLabelPosition: 'end',
    columns: 2,
    items: [
        { label: 'Whatsapp', icon: '...' },
        { label: 'X', icon: '...' },
        { label: 'LinkedIn', icon: '...' },
        { label: 'Slack', icon: '...' },
        { label: 'Email', icon: '...' },
        { label: 'Link', icon: '...' },
    ],
},
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-flow-row.jpg)

**Example Items Flow Column:**

```typescript
{ ..., itemsFlow: 'column' },
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-group-items-grid-flow-column.jpg)

### The Directive

Use the directive in a `<button>` element to trigger your menu.

> 🛑 **A11y Strict Constraint:** To guarantee proper keyboard navigation and screen reader support, the `a11yMenu` directive **must** be attached to a native `<button>` or an element with `role="button"` and a valid `tabindex`.
>
> ❌ If applied to a non-interactive element (like a simple `<div>` or `<span>`), the library will throw an error.

- **Selector:** `[a11yMenu]`
- **Exported As:** `a11yMenu`

  > From the exported instance of the menu, the directive exposes a context object containing several useful methods.
  >
  > - **Property:** `menuContext`
  > - **Type:** [`MenuContext`](#the-menu-context)

#### The Directive Inputs

| Name | Type | Description |
| :--- | :--- | :---------- |
| `a11yMenu` | `Menu` | See [the `a11yMenu` Input](#the-a11ymenu-input) |
| `a11yMenuLabel` | `string` | See [the `a11yMenuLabel` Input](#the-a11ymenulabel-input) |
| `a11yMenuConfig` | `MenuConfig` | See [the `a11yMenuConfig` Input](#the-a11ymenuconfig-input) |
| `a11yIconTemplate` | `TemplateRef<unknown>` | See [the `a11yIconTemplate` Input](#the-a11yicontemplate-input) |

##### The `a11yMenu` Input

The main entry point for your data. It expects the array containing all your menu items.

- **Property:** `a11yMenu`
- **Type:** [`Menu`](#the-menu-items-array), alias for an array of:
  - [`MenuItemAction`](#the-menuitemaction-type)
  - [`MenuItemSubmenu`](#the-menuitemsubmenu-type)
  - [`MenuItemInfo`](#the-menuiteminfo-type)
  - [`MenuItemSeparator`](#the-menuitemseparator-type)
  - [`MenuGroup`](#the-menugroup-type)

##### The `a11yMenuLabel` Input

Provides a custom `aria-label` for screen readers, giving this specific menu instance a unique accessible name. This overrides any [global label already set in the configuration](#the-menu-label).

- **Property:** `a11yMenuLabel`
- **Type:** `string`

##### The `a11yMenuConfig` Input

Allows you to pass an instance-level configuration object.

> ❗❗ Any property defined here will override the global settings defined at the module level for this specific menu.

- **Property:** `a11yMenuConfig`
- **Type:** [`MenuConfig`](#global-configuration)

##### The `a11yIconTemplate` Input

A reference to an Angular `<ng-template>` to render the icons for this specific instance of the menu.

> 💡 The template receives the icon string (defined in your items array) as its implicit context.

- **Property:** `a11yIconTemplate`
- **Type:** `TemplateRef<unknown>`

✨ See [the example on how to configure a custom icon template](#icons-setup-via-local-template).

#### The Directive Outputs

| Name | Type | Description |
| :--- | :--- | :---------- |
| `itemSelected` | `EventEmitter<MenuItemSelected>` | See [the `itemSelected` Output](#the-itemselected-output) |
| `menuOpened` | `EventEmitter<MenuOpenReason>` | See [the `menuOpened` Output](#the-menuopened-output) |
| `menuClosed` | `EventEmitter<MenuCloseReason>` | See [the `menuClosed` Output](#the-menuclosed-output) |

##### The `itemSelected` Output

Emits the item object when it gets selected.

> ⚡ **IMPORTANT:** This output **will not** emit if the selected item has its own custom [`action`](#the-action-property) or [`beforeChange`](#the-beforechange-property) callback defined. The local function takes precedence over this global event.

- **Property:** `itemSelected`
- **Type:** `EventEmitter<MenuItemSelected>`
- **Properties:**

  | Name | Type | Description |
  | :--- | :--- | :---------- |
  | `item` | [`MenuItemAction`](#the-menuitemaction-type) or [`MenuItemSelectable`](#the-menuitemselectable-type) | The selected item |
  | `group` | [`MenuGroup`](#the-menugroup-type) _(Optional)_ | The parent group's snapshot **after** the change (only when `'checkbox'` or `'radio'`) |

##### The `menuOpened` Output

Emits when the menu opens.

- **Property:** `menuOpened`
- **Type:** `EventEmitter<MenuOpenReason>`
  - `'click'`: Opened via mouse/pointer.
  - `'keyboard'`: Opened via keyboard.

##### The `menuClosed` Output

Emits when the menu is dismissed or destroyed.

- **Property:** `menuClosed`
- **Type:** `EventEmitter<MenuCloseReason>`
  - `'escape'`: Closed after pressing the `Escape` key.
  - `'keyboard'`: Closed after pressing `Tab` (if allowed), `F10` or any of the `Alt` keys.
  - `'toggle'`: Closed after activating the trigger again while the menu was already open (e.g., pointer click or Screen Reader activation).
  - `'item-selected-click'`: Closed after selecting an action item with the mouse.
  - `'item-selected-keyboard'`: Closed after selecting an action item with the keyboard.
  - `'click-outside'`: Closed after clicking anywhere outside the menu overlay.
  - `'touch-outside'`: Closed after touching (touch or pen) anywhere outside the menu overlay.
  - `'wheel-outside'`: Closed after using the mouse wheel outside the menu overlay (if applies).
  - `'mobile-back'`: Closed via the device's "back" navigation (button or gesture).
  - `'programmatically'`: Closed via the menu's context `closeMenu()` method.
  - `'host-destroyed'`: Closed because the host (trigger `<button>`) was removed from the DOM.
  - `'internal'`: Closed automatically by the library's internal logic (e.g., when a new menu is created without destroying the active one).

### The Programmatic API

These contexts provide specialized methods to control the menu instance or to mutate specific items on the fly.

> 🧠 **ARCHITECTURE NOTE: Object References**
>
> The `item` object exposed by the contexts (and emitted by [the `(itemSelected)` event](#the-itemselected-output)) is passed **by reference**. It is the _exact same object_ from your original source array.

- [The Menu Context](#the-menu-context)
- [The Item Context](#the-item-context)

#### The Menu Context

This context exposes methods to manage some basics on the menu while the menu **is open**.

> ❗❗❗ **EXTREMELY IMPORTANT:** To retrieve an item using any of the "getItem" methods, that item **must** have its `value` property defined with a unique identifier, otherwise you'll get `undefined`.
>
> 💡 **NOTE:** All the "getItem" methods listed below, return a `MenuContextForItem<T>` object, which includes:
>
> - `item`: The requested item object.
> - `update(data: T)`: A method to update some of the item's data.
>
> 🚫 **RESTRICTION:** The `update()` method is explicitly designed for small, real-time visual tweaks (like toggling a loading icon or updating a status text) while the user is actively interacting with the **open** menu. For that reason, it **cannot** be used to modify core structural properties like: `'value'`, `'action'`, `'beforeChange'`, `'closeOnSelect'`, `'submenu'`, `'items'`, `'shortcut'` or `'checked'`.
>
> ⚠️ **Watch out with arrays:** The method performs a **shallow merge** at the first level of the properties.
> If you update the `className` property, it will completely overwrite the existing value set when the menu was created. If you need to append a new value while keeping the old ones, use the spread operator:
>
> ```typescript
> const actionSavePDF = menuCtx.getActionItem('save-pdf');
> if (!actionSavePDF) return;
>
> actionSavePDF.update({
>     // assuming you established an array the first time for your "className"
>     className: [...actionSavePDF.item.className, 'danger'],
> });
> ```

- **Type:** `MenuContext`
- **Available Methods:**
  - `announce(message: string)`
    - **Description:** Announces the given message for screen reader users.
  - `closeMenu()`
    - **Description:** Programmatically closes the menu.
  - `getItemAction(value: string)`
    - **Description:** Retrieves an "action" item by its `value` property.
    - **Returns:** `MenuContextForItem<MenuItemAction>` or `undefined`
  - `getItemInfo(value: string)`
    - **Description:** Retrieves an "info" item by its `value` property.
    - **Returns:** `MenuContextForItem<MenuItemInfo>` or `undefined`
  - `getItemSelectable(value: string)`
    - **Description:** Retrieves a "selectable" (checkbox or radio) item by its `value` property.
    - **Returns:** `MenuContextForItem<MenuItemSelectable>` or `undefined`
  - `getItemSubmenu(value: string)`
    - **Description:** Retrieves a "submenu" item by its `value` property.
    - **Returns:** `MenuContextForItem<MenuItemSubmenu>` or `undefined`

> 💡 You can access this context in two ways:
>
> 1. **Via the Directive:**<br>
>    Using a template reference variable in your HTML and `@ViewChild()` in your component class.
>
>    ```html
>    <button [a11yMenu]="..." #myMenu="a11yMenu">...</button>
>    ```
>
>    ```typescript
>    @ViewChild('myMenu') private myMenu: MenuDirective;
>
>    myMethod(): void {
>        ...
>        this.myMenu.menuContext?.closeMenu();
>    }
>    ```
>
> 2. **Via the Action Callback:**<br>
>    It is automatically injected as the **second parameter** of an item's custom `action` or `beforeChange`.
>
>    ```typescript
>    myMenuItems: Menu = [
>        {
>            label: 'Save',
>            action: (_, menuCtx: MenuContext) => { ... },
>        },
>    ];
>    ```

#### The Item Context

This context provides localized methods scoped strictly to the item the user interacted with (e.g., to toggle its icon to a loading spinner or update its _busy_ state).

- **Type:** `MenuItemContext`
- **Available Properties & Methods:**
  - `item` _(property)_
    - **Description:** The activated item object.
    - **Type:** [`MenuItemAction`](#the-menuitemaction-type) or [`MenuItemSelectable`](#the-menuitemselectable-type)
  - `setLabel(label: string)`
    - **Description:** Dynamically updates the item's label.
  - `setIcon(icon: MenuItemIcon)`
    - **Description:** Dynamically updates the item's icon.
  - `setBusy(isBusy: boolean, message?: string)`
    - **Description:** Sets the item in a "busy" state. This prevents the user from reactivating the item while it's "working" on something and, more importantly, it helps screen reader users to understand that the page is _busy_.
      > 💡 You can provide an optional `message` (e.g., "saving changes") to give extra context for screen reader users.
      >
      > Please check [the Default Animation & Dynamic Updates example](#default-animation--dynamic-updates).
  - `setDisabled(isDisabled: boolean)`
    - **Description:** Dynamically enables or disables the item.

> 💡 You can access this context:
>
> - **Via the Action Callback:**<br>
>   It is injected as the **first parameter** of an item's custom `action` or `beforeChange`.
>
>    ```typescript
>    myMenuItems: Menu = [
>        {
>            label: 'Save',
>            action: (itemCtx: MenuItemContext) => { ... },
>        },
>    ];
>    ```

## Advanced Usage: Building a Custom Menu Wrapper

> 🌟 Here is a fact: the [`a11yMenu` directive](#the-directive) documented in the previous section is actually just a wrapper. It simply implements the core A11y Menu engine under the hood.
>
> 💪 This means that you can use the exact same engine to build your own complex, fully accessible UI components, such as a **Menubar**, a **ContextMenu**, or your own menu.

To build your own component without overriding the global menu settings of the application, you must:

1. [Set up your _custom_ feature configuration](#feature-configuration)
2. [Understand the `selector`](#the-selector)
3. [Create a Context Menu (example)](#feature-example-building-a-context-menu)

### Feature Configuration

This method generates an isolated configuration to ensure your custom component or library has its own defaults.

> ❌ **IMPORTANT:** **Do not** use this in the main application.
>
> 💡 Your custom configuration acts as a layer. Any property you omit here will automatically [fall back to the global configuration](#global-configuration), and finally to the library's base defaults.

Accepts a single parameter `config` of type [`MenuCustomConfig`](#the-menucustomconfig-object).

**On Angular v12 - v14:**

```typescript
import { A11yMenuModule } from '@a11y-ngx/menu';

@NgModule({
    imports: [
        A11yMenuModule.customConfig({
            selector: 'a11y-menu.my-context-menu',
            className: 'my-context-menu',
            offsetSubmenu: 5,
        }),
    ]
})
export class MyContextMenuModule {}
```

**On Angular v15+:**

```typescript
import { provideA11yMenuFeature } from '@a11y-ngx/menu';

export const contextMenuProviders = {
    providers: [
        provideA11yMenuFeature({
            selector: 'a11y-menu.my-context-menu',
            className: 'my-context-menu',
            offsetSubmenu: 5,
        }),
    ],
};
```

### The `MenuCustomConfig` Object

This object accepts all the properties from [`MenuConfig`](#global-configuration) to override them locally, plus some exclusive properties specifically designed for wrapper development:

| Property | Type | Default | Description |
| :------- | :--- | :-----: | :---------- |
| `selector` | `string` | `undefined` | See [the Selector](#the-selector) |
| `closeOnClickOutside` | `boolean` | `true` | See [Close On Click Outside](#close-on-click-outside) |
| `closeOnTab` | `boolean` | `true` | See [Close On Tab](#close-on-tab) |
| `positionsAllowed` | `OverlayPositionsAllowedInput` | `'auto'` | See [the Positions Allowed](#the-positions-allowed) |
| `focusItemWhenOpen` | `'first'`, `'last'` or `undefined` | `undefined` | See [Focus Item When Open](#focus-item-when-open) |

#### The Selector

Acts as the **unique identifier** for your custom menu configuration.

The internal engine uses this CSS selector to track your specific menu instance in the DOM, which is crucial for handling global events like "click outside" when closing the menu.

- **Property:** `selector` 🔴 _(mandatory)_
- **Type:** `string`

> ⚠️ **IMPORTANT:** When defining a new feature, both `selector` and `className` properties are **mandatory**. The `selector` value **must** match the actual HTML element rendered by the engine.
>
> 💡 For example, if you set `className: 'my-context-menu'` and the engine creates `<a11y-menu class="my-context-menu">`, we strongly recommend making the selector as specific as possible (like `'a11y-menu.my-context-menu'`). This prevents accidental collisions with other elements in your application that might share the same class name.

#### Close On Click Outside

Determines whether the menu should automatically close when the user clicks anywhere outside of it.

- **Property:** `closeOnClickOutside` ⭕ _(optional)_
- **Type:** `boolean`
- **Default:** `true`

#### Close On Tab

Determines whether the menu should automatically close when the user presses the `Tab` key. This ensures the menu doesn't stay open if the user wants to navigate to the next focusable element on the page.

- **Property:** `closeOnTab` ⭕ _(optional)_
- **Type:** `boolean`
- **Default:** `true`

#### The Positions Allowed

Defines the allowed fallback positions when there is not enough viewport space to render the menu in its primary direction.

- **Property:** `positionsAllowed` ⭕ _(optional)_
- **Type:** `OverlayPositionsAllowedInput`
- **Default:** `'auto'` 👉 Meaning that all positions are allowed (top, bottom, left and right)

> 💡 Please refer to [The Positions Allowed Input](https://www.npmjs.com/package/@a11y-ngx/overlay-base#the-positions-allowed-input) within the Overlay Base Library for more details.

#### Focus Item When Open

Determines which item should automatically receive focus when the root menu opens.

> **NOTE:** This only applies to the root menu; submenus automatically handle their own focus.

- **Property:** `focusItemWhenOpen` ⭕ _(optional)_
- **Type:** `'first'`, `'last'` or `undefined`
- **Default:** `'undefined'`

> 💡 **Use Case:** This is especially useful when building custom wrappers like a `Menubar`.
>
> According to standard accessibility patterns, if a user focuses a menubar item and:
>
> - Press `ArrowDown`, the menu should open and focus the `'first'` item.
> - Press `ArrowUp`, it should open focusing the `'last'` item.
>
> This property allows you to programmatically replicate that behavior.

### The Core Services

To build a custom wrapper dynamically, you will use these two main services:

- 🛠️ `MenuDirectorService`: Responsible for creating and opening the menu panel in the DOM.
- 🧠 `MenuService`: The brain of the menu. It manages the current state, active items, and exposes observables to react to menu events.

> 💡 **NOTE: Explore the API**
>
> `MenuService` is a massive class with a lot of useful getters, subjects, and methods (e.g., closing the menus, tracking active items, etc.). Instead of listing them all here, we highly recommend relying on your IDE's IntelliSense to explore its full capabilities (**everything** has its own comment).

### Feature Example: Building a Context Menu

Let's put the advanced configuration into practice. The following example demonstrates how to wrap the core engine to create a custom Context Menu, dynamically positioned wherever the user right-clicks.

> ⚠️ **DISCLAIMER: This is a simplified example**
>
> Real context menus are **far more complex** than what we are presenting here. This is just a quick example to show you how easy it is to use the menu engine inside your own wrapper.
>
> A production-ready context menu also needs to handle things like:
>
> - Opening via keyboard shortcuts (like `Shift + F10` or the dedicated "Context Menu" key).
> - Establishing first focus perfectly depending on how it was opened (mouse or keyboard).
> - Etc.

**Custom Config within your Context Menu Module:**

Continuing with the example configured before, we override some specific behavior that Context Menus **do not share** with regular Menus:

```typescript
A11yMenuModule.customConfig({
    // We define the selector
    // 1. "a11y-menu" is the main component created by the menu engine
    // 2. "my-context-menu" is the class name given to this config in the next line
    selector: 'a11y-menu.my-context-menu',
    // We apply the class name to match the selector
    className: 'my-context-menu',
    // Context Menu opens at right (position), start (alignment)
    position: 'right-start',
    // We allow only opposite positions (right => left)
    positionsAllowed: 'opposite',
    // Context Menus should not close on Tab key
    closeOnTab: false,
}),
```

**The Context Menu Directive:**

```typescript
import { Directive, Input, Output, OnDestroy, EventEmitter } from '@angular/core';
import { merge, Subject } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';

import { Menu, MenuConfig, MenuService, MenuDirectorService, MenuItemSelected, MenuCloseReason } from '@a11y-ngx/menu';

@Directive({
    selector: '[myContextMenu]',
    host: {
        '(contextmenu)': 'onContextMenu($event)',
    },
})
export class MyContextMenuDirective implements OnDestroy {
    @Input('myContextMenu') items: Menu = [];
    @Input('myContextMenuConfig') config: MenuConfig = {};

    @Output() itemSelected: EventEmitter<MenuItemSelected> = new EventEmitter<MenuItemSelected>();

    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(private menuService: MenuService, private menuDirector: MenuDirectorService) {}

    ngOnDestroy(): void {
        // We destroy the entire menu when host gets removed from the DOM
        this.menuService.destroyMenu({ closeReason: 'host-destroyed' });

        this.destroy$.next();
        this.destroy$.complete();
    }

    protected onContextMenu(event: PointerEvent): void {
        // We stop propagation & block the current context-menu action
        event.stopPropagation();
        event.preventDefault();

        // We create the custom pointer DOMRect
        const trigger: DOMRect = new DOMRect(event.clientX, event.clientY, 1, 1);

        // 2. We create the Root Menu, passing:
        this.menuDirector.createRootMenu(
            // a. The Trigger (the clicked point)
            trigger,
            // b. The Data (items)
            this.items,
            // c. The Selector we established in the main config
            'a11y-menu.my-context-menu',
            // d. The (instance) Config
            this.config
        );

        // We listen for the selected item to emit
        this.menuService.menuItemSelected$
            .pipe(takeUntil(merge(this.destroy$, this.menuService.rootMenuDestroyed$)))
            .subscribe((item: MenuItemSelected) => this.itemSelected.emit(item));

        // We listen when the menu gets destroyed in case we have to execute some things
        this.menuService.rootMenuDestroyed$
            .pipe(takeUntil(this.destroy$), take(1))
            .subscribe((closeReason: MenuCloseReason) => {
                // ... cleanup or focus restoration logic
            });
    }
}
```

**Within Your App:**

```typescript
// Your context menu items
myContextMenuItems: Menu = [
    {
        label: 'Reload',
        value: 'reload',
        icon: 'fa-solid fa-rotate-right',
        shortcut: { ctrlCmd: true, key: 'R' },
    },
    { separator: true },
    {
        label: 'Save As...',
        value: 'save-as',
        icon: 'fa-solid fa-floppy-disk',
        shortcut: { ctrlCmd: true, shift: true, key: 'S' },
    },
    {
        label: 'Print',
        value: 'print',
        icon: 'fa-solid fa-print',
        shortcut: { ctrlCmd: true, key: 'P' },
    },
];

onContextMenuSelected(data: MenuItemSelected): void {
    console.log('Context Menu Selection:', data.item.value);
    // Execute your logic here based on the value...
}
```

**Template:**

```html
<div
    [myContextMenu]="myContextMenuItems"
    (itemSelected)="onContextMenuSelected($event)">
    Right click here!
</div>
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-context-menu.jpg)

## Mobile Experience

By default, when the menu detects a small viewport, it automatically becomes a bottom drawer.

> 💡 **Customizing the Breakpoint:** The drawer triggers at `768px` by default. You can override this globally by passing a custom pixel value to the configuration object during your app setup:
>
> **On Angular v12 - v14:**
>
> ```typescript
> import { A11yMobileModule } from '@a11y-ngx/menu';
> 
> @NgModule({
>     imports: [
>         A11yMobileModule.rootConfig({ breakpoint: 800 }),
>     ],
> })
> export class AppModule {}
> ```
>
> **On Angular v15+:**
>
> ```typescript
> import { provideA11yMobile } from '@a11y-ngx/menu';
> 
> export const appConfig: ApplicationConfig = {
>     providers: [
>         provideA11yMobile({ breakpoint: 800 }),
>     ],
> };
> ```

We know that forcing a drawer layout might not fit every specific design need right now. However, managing a floating dropdown in constrained screens (while keeping it 100% accessible, preventing overflow and maintaining proper touch targets) is highly complex.

For now, this drawer approach guarantees a solid, accessible and touch-friendly experience out of the box.

> **Navigation & Behavior**
>
> - The root menu displays only a "Close" button, while submenus display both "Back" and "Close" buttons.
> - Tapping the "Close" button or the background overlay (backdrop) completely closes the **entire** menu immediately, regardless of how deep you are in the submenus.
> - Pressing the device's native back button navigates back one level at a time.

**The Root Menu:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-mobile-root-menu.jpg)

**The Submenu:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-mobile-submenu.jpg)

## Menu DOM Structure

Inspecting the menu via browser dev tools is difficult because it auto-closes on blur. Use this DOM anatomy reference to easily write your custom CSS overrides or E2E tests without fighting the debugger.

> 💡 **NOTE:** To keep the DOM clean and avoid class name collisions, this library uses HTML attributes instead of classes for its internal structure. If you need to target these elements in your CSS, make sure to use attribute selectors (e.g., `[menu-item]`).

```html
<a11y-menu role="menu" class="a11y-menu [your-custom-class]" theme="[light | dark]">
    <!-- Action Item -->
    <a11y-menu-item menu-item role="menuitem" class="[your-custom-class]">
        <a11y-icon menu-item-icon>...</a11y-icon>
        <span menu-item-label>...</span>
        <span menu-item-shortcut>...</span>
    </a11y-menu-item>

    <!-- Submenu Item -->
    <a11y-menu-item menu-item role="menuitem" class="[your-custom-class]" aria-haspopup="menu" aria-expanded="[true | false]">
        <a11y-icon menu-item-icon>...</a11y-icon>
        <span menu-item-label>...</span>
        <span menu-item-caret>...</span>
    </a11y-menu-item>

    <!-- Info Item -->
    <a11y-menu-item-info menu-item-info role="none" class="[your-custom-class]">
        <a11y-icon menu-item-icon>...</a11y-icon>
        <span menu-item-label>...</span>
    </a11y-menu-item-info>

    <!-- Separator -->
    <a11y-menu-separator role="separator" aria-orientation="horizontal" />

    <!-- Stacked Group (Default) -->
    <a11y-menu-group role="group" menu-group="[common | checkbox | radio]" class="[your-custom-class]">
        <!-- Group Label -->
        <div menu-group-label>...</div>

        <!-- Checkbox Item -->
        <a11y-menu-item menu-item role="menuitemcheckbox" aria-checked="[true | false]">
            <span menu-item-select>
                <a11y-menu-item-check item-check="checkbox" />
            </span>
            <a11y-icon menu-item-icon>...</a11y-icon>
            <span menu-item-label>...</span>
            <span menu-item-shortcut>...</span>
        </a11y-menu-item>

        <!-- Radio Item -->
        <a11y-menu-item menu-item role="menuitemradio" aria-checked="[true | false]">
            <span menu-item-select>
                <a11y-menu-item-check item-check="radio" />
            </span>
            <a11y-icon menu-item-icon>...</a11y-icon>
            <span menu-item-label>...</span>
            <span menu-item-shortcut>...</span>
        </a11y-menu-item>
    </a11y-menu-group>

    <!-- Inline Group (mostly when 'inline/grid' items layout) -->
    <a11y-menu-group-inline role="group" menu-group="inline" layout="[stack | inline]" class="[your-custom-class]">
        <a11y-icon menu-item-icon>...</a11y-icon>
        <span menu-group-label>...</span>
        <!-- a. Items with normal label (above, start or end), tooltip or floating panel -->
        <span menu-group-items>
            <a11y-menu-item menu-item>...</a11y-menu-item>
            <a11y-menu-separator role="separator" aria-orientation="vertical" />
        </span>
        <!-- b. Items with fixed panel -->
        <span menu-group-wrapper>
            <div menu-group-panel-label>...</div>
            <span menu-group-items>
                <a11y-menu-item menu-item>...</a11y-menu-item>
            </span>
        </span>
    </a11y-menu-group-inline>
</a11y-menu>
```

> **NOTES:**
>
> - If a menu does not have a specific theme defined (falling back to the system's default), the `theme` attribute **won't** be added.
> - The `layout` attribute on the `<a11y-menu-group-inline>` element maps directly to your [group layout configuration](#the-group-layout).
> - When an item enters a _busy state_, either just _that_ item or the entire group will get the `aria-busy="true"` attribute (depending on [your `busyScope` config](#the-group-busy-scope)). To target the _specific_ item that triggered the state, use the `[item-busy]` attribute selector. Please refer to [the Busy State in Selectable Groups example](#the-busy-state-in-selectable-groups).

## Examples

- [Basic Menu](#basic-menu)
- [The Submenu](#the-submenu)
- [Default Icons Setup](#default-icons-setup)
  - [With Images](#icons-setup-with-images)
  - [Via Content Projection](#icons-setup-via-content-projection)
  - [Via Component Inputs](#icons-setup-via-component-inputs)
  - [Via Local Template](#icons-setup-via-local-template)
- [The Zoom Info Item](#the-zoom-info-item)
- [Selectable Groups](#selectable-groups)
  - [Custom Color Picker](#custom-color-picker)
- [The Busy State: Async Actions](#the-busy-state-async-actions)
  - [Default Animation & Dynamic Updates](#default-animation--dynamic-updates)
  - [Adding a Custom Loading Spinner](#adding-a-custom-loading-spinner)
  - [The Busy State In Selectable Groups](#the-busy-state-in-selectable-groups)

### Basic Menu

Let's start with the basics. By providing a simple list of items, you can get a fully accessible menu up and running in seconds.

Use the `(itemSelected)` event to trigger any action in your application when an item is chosen.

**Typescript:**

```typescript
import { Menu, MenuItemSelected } from '@a11y-ngx/menu';

...

myMenuItems: Menu = [
    { label: 'New', value: 'file-new', },
    { label: 'Open...', value: 'file-open', },
    { separator: true },
    { label: 'Save', value: 'file-save', },
    { label: 'Save as...', value: 'file-save-as', },
    { separator: true },
    {
        label: 'Delete',
        value: 'file-delete',
        className: 'file-delete',
    },
];

onItemSelected(data: MenuItemSelected): void {
    console.log('User Selection:', data.item.value);
    // Execute your logic here based on the value...
}
```

**CSS:**

```css
a11y-menu .file-delete {
    --menu-item-text-color: #b91010;
}
```

**Template:**

```html
<button
    [a11yMenu]="myMenuItems"
    (itemSelected)="onItemSelected($event)">
    Menu
</button>
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-basic-menu.jpg)

### The Submenu

For complex applications with numerous actions, you can organize your items into cascading submenus.

> 💪 The library fully supports infinite nesting levels and automatically handles all the complex logic under the hood, including hover intents, focus management and left/right keyboard navigation.

**Typescript:**

```typescript
myMenuItems: Menu = [
    ...,
    {
        label: 'Share',
        icon: 'fa-solid fa-share',
        submenu: [
            { label: 'Copy link', icon: '...' },
            { label: 'Email', icon: '...' },
            { separator: true },
            { label: 'Share with...', icon: '...' },
        ],
    },
    ...
];
```

**Template:**

```html
<button [a11yMenu]="myMenuItems">Menu</button>
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-submenu.jpg)

### Default Icons Setup

If your application already uses a specific component for rendering icons (either third-party or custom), you can provide it to the `A11yMenuModule` root config. This ensures the menu seamlessly uses your existing design system.

Alternatively, you can define a custom `TemplateRef` and pass it directly to a specific menu instance for local overrides.

Choose the setup that matches your architecture:

Global Configurations:

- [With Images](#icons-setup-with-images)
- [Via Content Projection](#icons-setup-via-content-projection) (e.g., Material Icons)
- [Via Component Inputs](#icons-setup-via-component-inputs) (e.g., Lucide, Heroicons, Custom)

Local Override:

- [Via Local Template](#icons-setup-via-local-template)

#### Icons Setup: With Images

**Root Config within the App Module:**

```typescript
import { A11yMenuModule } from '@a11y-ngx/menu';
import { MatIcon } from '@angular/material/icon';

@NgModule({
    ...,
    imports: [
        A11yMenuModule.rootConfig({
            iconDefaultStrategy: 'image',
        }),
    ],
})
export class AppModule {}
```

**Typescript:**

```typescript
myMenuItems: Menu = [
        {
            label: 'Reload',
            icon: '/assets/images/menu/icon-reload.png',
            shortcut: { ctrlCmd: true, key: 'R' },
        },
        { separator: true },
        {
            label: 'Save As...',
            icon: '/assets/images/menu/icon-save-as.png',
            shortcut: { ctrlCmd: true, shift: true, key: 'S' },
        },
        {
            label: 'Print',
            icon: '/assets/images/menu/icon-print.png',
            shortcut: { ctrlCmd: true, key: 'P' },
        },
    ];
```

**Template:**

```html
<button [a11yMenu]="myMenuItems">Menu</button>
```

**Will Render As:**

```html
<a11y-icon aria-hidden="true" menu-item-icon>
    <img src="/assets/images/menu/icon-reload.png" alt="">
</a11y-icon>

```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-default-icon-images.jpg)

#### Icons Setup: Via Content Projection

This approach is required when your icon component expects the icon name as inner text (e.g., using `<ng-content>`). This is the standard behavior for libraries like Angular Material.

> 🛠️ Within the `rootConfig()` in your app module:
>
> 1. You have to provide `MatIcon` as the _component_.
> 2. Since Material uses content projection, you'll have to pass "content" as the _main entry_.

**Root Config within the App Module:**

```typescript
import { A11yMenuModule } from '@a11y-ngx/menu';
import { MatIcon } from '@angular/material/icon';

@NgModule({
    ...,
    imports: [
        A11yMenuModule.rootConfig({
            iconDefaultStrategy: {
                component: MatIcon,
                mainEntry: 'content',
            },
        }),
    ],
})
export class AppModule {}
```

**Typescript:**

```typescript
myMenuItems: Menu = [
    { label: 'Settings', icon: 'settings' },
    {
        label: 'My Preferences',
        icon: 'account_circle', // the string used within content projection
        submenu: [
            {
                label: 'Site Language',
                type: 'radio',
                items: [
                    { label: 'English', checked: true },
                    { label: 'Spanish' },
                    { label: 'French' },
                    { label: 'Portuguese' },
                ],
            },
            {
                label: 'Notifications & Alerts',
                type: 'checkbox',
                items: [
                    { label: 'Sound Effects', icon: 'notifications_active', checked: true },
                    { label: 'Desktop Notifications', icon: 'announcement' },
                ],
            },
        ],
    },
    { label: 'Help', icon: 'help_outline' },
    { separator: true },
    { label: 'Logout', icon: 'logout', className: 'logout' },
];
```

**CSS:**

```css
a11y-menu .logout {
    --menu-item-text-color: #b91010;
}
```

**Template:**

```html
<button [a11yMenu]="myMenuItems">Menu</button>
```

**Will Render As:**

```html
<a11y-icon aria-hidden="true" menu-item-icon>
    <mat-icon ...>settings</mat-icon>
</a11y-icon>

```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-default-icon-material.jpg)

#### Icons Setup: Via Component Inputs

This approach is required when your icon component expects the icon identifier through an input binding. This is the standard behavior for modern SVG libraries like Lucide Angular, Heroicons, or _our_ very own custom `AppIconComponent` (check below).

> 🌟 For demonstration purposes, we'll assume your app already uses Font Awesome web fonts.
>
> 🛠️ Within the `rootConfig()` in your app module:
>
> 1. You have to provide your `AppIconComponent` as the _component_.
> 2. Since our component uses inputs, you'll have to pass "input" as the _main entry_ and specify the main "input name".

**Your Custom Icon Component:**

```typescript
import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-icon',
    template: '',
    host: {
        // Since Font Awesome is based on 'class names',
        // we'll apply them to the host
        '[class]': 'icon',
    },
})
export class AppIconComponent {
    @Input() icon!: string;
}
```

**Root Config within the App Module:**

```typescript
import { A11yMenuModule } from '@a11y-ngx/menu';
import { AppIconComponent } from './.../app-icon.component';

@NgModule({
    ...,
    imports: [
        A11yMenuModule.rootConfig({
            iconDefaultStrategy: {
                component: AppIconComponent,
                mainEntry: 'input',
                inputName: 'icon',
            },
        }),
    ],
})
export class AppModule {}
```

**Typescript:**

```typescript
myMenuItems: Menu = [
    {
        label: 'New',
        // The Font Awesome class names that will be inserted in our component's input
        icon: 'fa-regular fa-file',
        shortcut: { ctrlCmd: true, key: 'N' },
    },
    {
        label: 'Open...',
        icon: 'fa-regular fa-folder-open',
        shortcut: { ctrlCmd: true, key: 'O' },
    },
    { separator: true },
    {
        label: 'Save',
        icon: 'fa-regular fa-floppy-disk',
        shortcut: { ctrlCmd: true, key: 'S' },
    },
    {
        label: 'Save as...',
        icon: 'fa-solid fa-floppy-disk',
        shortcut: { ctrlCmd: true, shift: true, key: 'S' },
    },
    { separator: true },
    {
        label: 'Delete',
        icon: 'fa-regular fa-trash-can',
        className: 'delete',
    },
];
```

**CSS:**

```css
a11y-menu .delete {
    --menu-item-text-color: #b91010;
}
```

**Template:**

```html
<button [a11yMenu]="myMenuItems">Menu</button>
```

**Will Render As:**

```html
<a11y-icon aria-hidden="true" menu-item-icon>
    <app-icon class="fa-regular fa-file"></app-icon>
</a11y-icon>
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-default-icon-font-awesome.jpg)

#### Icons Setup: Via Local Template

Sometimes, you might need a specific menu to use a different icon set than the rest of your application.

For example, if you configured Font Awesome globally, but a particular menu requires Material Icons, you can pass a custom `<ng-template>` directly to that instance.

> 💡 **Scope & Priority**
>
> Providing an `[a11yIconTemplate]` is a local override. It only affects that specific instance of the menu and takes top priority, completely ignoring any global `iconDefaultStrategy` you might have provided in the module's setup.

**Typescript:**

```typescript
myMenuItems: Menu = [
    {
        label: 'Contrast',
        // The Material Icon name that will be passed as the implicit context
        icon: 'contrast',
    },
    { label: 'Brightness', icon: 'brightness_7' },
    { separator: true },
    { label: 'Crop', icon: 'crop' },
];
```

**Template:**

```html
<ng-template #matIconTemplate let-icon>
    <mat-icon>{{ icon }}</mat-icon>
</ng-template>

<button 
    [a11yMenu]="myMenuItems" 
    [a11yIconTemplate]="matIconTemplate">
    Options
</button>
```

**Will Render As:**

```html
<a11y-icon aria-hidden="true" menu-item-icon>
    <mat-icon ...>contrast</mat-icon>
</a11y-icon>
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-directive-icon-template.jpg)

### The Zoom Info Item

Sometimes you need more than just clickable options. By combining action buttons and a read-only info item, you can create your own interactive mini toolbar directly inside your dropdown menu.

In this example, we build a Zoom control panel. The info item acts as a dynamic display sitting perfectly between two buttons, allowing users to increment or decrement the zoom level without the menu closing.

**Typescript:**

```typescript
myMenuItems: Menu = [
    ...,
    {
        label: 'Zoom',
        icon: 'fa-solid fa-magnifying-glass',
        layout: 'inline',
        itemsLayout: 'inline',
        itemsLabelPosition: 'tooltip',
        itemsJustify: 'end',
        className: 'zoom-group',
        items: [
            {
                label: 'Zoom out',
                icon: 'fa-solid fa-minus',
                value: 'zoom-out',
                closeOnSelect: false,
                action: (_, menuCtx) => this.applyZoom('out', menuCtx),
            },
            { info: '100%', value: 'zoom-info' },
            {
                label: 'Zoom in',
                icon: 'fa-solid fa-plus',
                value: 'zoom-in',
                closeOnSelect: false,
                action: (_, menuCtx) => this.applyZoom('in', menuCtx),
            },
            { separator: true },
            {
                label: 'Full screen',
                icon: 'fa-solid fa-expand',
                shortcut: { key: 'F11' },
                action: () => this.applyFullScreen(),
            },
        ],
    },
];

private currentZoom: number = 100;

private applyZoom(zoom: 'in' | 'out', menuCtx: MenuContext): void {
    const currentZoom: number = this.currentZoom;
    const minZoom: number = 10;
    const maxZoom: number = 200;
    const newZoom: number =
        zoom === 'in' ? Math.min(maxZoom, currentZoom + 10) : Math.max(minZoom, currentZoom - 10);

    if (newZoom === currentZoom) return;

    this.currentZoom = newZoom;

    // We retrieve the "zoom-out" item and update its disabled state
    menuCtx.getItemAction('zoom-out')?.update({ disabled: newZoom === minZoom });
    // We retrieve the "zoom-in" item and update its disabled state
    menuCtx.getItemAction('zoom-in')?.update({ disabled: newZoom === maxZoom });

    const appliedZoom: string = `${newZoom}%`;
    // We retrieve the "zoom-info" item and update it with the current zoom level
    menuCtx.getItemInfo('zoom-info')?.update({ info: appliedZoom });
    // We announce the current zoom level to the screen reader users
    menuCtx.announce(appliedZoom);

    // The rest of your code...
}

applyFullScreen(): void {
    ...
}
```

**CSS:**

```css
a11y-menu .zoom-group {
    [menu-item] {
        padding: 0;
        width: 40px;
        height: 40px;
    }
    [menu-item-info] {
        padding: 0;
        min-width: 60px;
        text-align: center;
    }
}
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-info-zoom.gif)

### Selectable Groups

The most common use case for selectable items is managing application state, like text formatting or view preferences. By organizing items into a group and defining the `type`, the menu automatically handles the selection logic for you.

In this classic text editor example, we combine three different groups:

1. **Checkboxes:** For text format (where you can have any of the items active at the same time).
2. **Radios:** For text alignment (where selecting one will automatically uncheck the others).
3. **Radios:** For paragraph styles (defining the structural hierarchy of the text).

**Typescript:**

```typescript
myMenuItems: Menu = [
    {
        type: 'checkbox',
        label: 'Text Format',
        showLabel: false,
        items: [
            {
                label: 'Bold',
                icon: 'fa-solid fa-bold',
                shortcut: { ctrlCmd: true, key: 'b' },
                checked: true,
            },
            {
                label: 'Italic',
                icon: 'fa-solid fa-italic',
                shortcut: { ctrlCmd: true, key: 'i' },
                checked: true,
            },
            {
                label: 'Underline',
                icon: 'fa-solid fa-underline',
                shortcut: { ctrlCmd: true, key: 'u' },
            },
            {
                label: 'Strikethrough',
                icon: 'fa-solid fa-strikethrough',
            },
        ],
    },
    {
        type: 'radio',
        label: 'Text Alignment',
        showLabel: false,
        items: [
            { label: 'Left', icon: 'fa-solid fa-align-left', checked: true },
            { label: 'Center', icon: 'fa-solid fa-align-center' },
            { label: 'Right', icon: 'fa-solid fa-align-right' },
            { label: 'Justify', icon: 'fa-solid fa-align-justify' },
        ],
    },
    {
        type: 'radio',
        label: 'Paragraph Styles',
        showLabel: false,
        items: [
            {
                label: 'Normal Text',
                shortcut: { ctrlCmd: true, alt: true, key: '0' },
                checked: true,
            },
            {
                label: 'Heading 1',
                shortcut: { ctrlCmd: true, alt: true, key: '1' },
            },
            {
                label: 'Heading 2',
                shortcut: { ctrlCmd: true, alt: true, key: '2' },
            },
            {
                label: 'Heading 3',
                shortcut: { ctrlCmd: true, alt: true, key: '3' },
            },
        ],
    },
];
```

> 💡 **Visually Hidden ↔️ Semantically Present**
>
> You might have noticed we used `showLabel: false` in all the groups.
>
> ⛔ For sighted users, a row of alignment icons is self-explanatory and a visible "Text Alignment" title would just add visual clutter.
>
> ✳️ However, screen reader users might find that context very helpful. By setting `showLabel: false`, the menu visually hides the text but keeps it semantically attached to the group for assistive technologies.
>
> 💪 This allows you to build clean, modern UIs without ever sacrificing accessibility!

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-selectable-groups.jpg)

**Testing with NVDA Screen Reader:**

Here is a proof of concept of how assistive technology processes this menu structure.

The following image shows the full speech output log from NVDA while navigating the menu with selectable groups. It demonstrates how your configuration translates into clear, meaningful information for a screen reader user, confirming correct grouping, selection types and shortcuts handling.

> ❤️ The main idea of showing this is to help you understand how important it is to have a well-structured menu with the right attributes and labels, so every user can experience it the same way.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-selectable-groups-nvda.jpg)

> ⚠️ **NOTE:** The exact speech output can vary depending on the Operating System, the Screen Reader used and the user's personal verbosity settings.

- The first thing the user hears is "menu".
- As we start navigating using _down arrow_, we reach the first item: "Bold".
  - Since that item belongs to a grouping that _has_ a label, we hear:
    1. "Text Format grouping"
    2. "Bold, checked, Ctrl+B, 1 of 12"
    > 💡 **What just happened?**
    >
    > As you can see, the screen reader announces all the relevant context to the user at once:
    >
    > - **The group label (if any) and context:** Text Format _Grouping_
    > - **The label:** Bold
    > - **The state:** _Checked_
    > - **The shortcut:** Ctrl+B
    > - **The item position within the menu:** 1 of 12
- As we keep moving down, we reach the second item, so we hear:
  - "Italic, checked, Ctrl+I, 2 of 12"
- Now we reach the third item, and we hear:
  - "Underline, **not** checked, Ctrl+U, 3 of 12"
- We bypass the "Strikethrough" item and reach the second group, so we hear:
    1. "Text Alignment grouping"
    2. "Left, radio menu item, checked, 5 of 12"
    > 💡 Now, the relevant information for radio buttons has slightly changed: we now hear "radio menu item" as part of the context
- We keep moving down to the next item, so we hear:
  - "Center, radio menu item, **not** checked, 6 of 12"
- And so on...

#### Custom Color Picker

Who says accessible menus have to look boring? By combining the grid layout with a custom `className` on a group, you can completely transform the visual appearance of radio buttons while keeping all the keyboard navigation and screen reader support intact.

In this example, we hide the default radio circle and turn the items into clickable color swatches.

**Typescript:**

```typescript
myMenuItems: Menu = [
    ...,
    {
        type: 'radio',
        label: 'Color',
        className: 'file-color',
        itemsLayout: 'grid',
        itemsLabelPosition: 'panel-above',
        items: [
            { label: 'Red', className: 'red' },
            { label: 'Orange', className: 'orange' },
            { label: 'Amber', className: 'amber' },
            { label: 'Yellow', className: 'yellow' },
            { label: 'Lime', className: 'lime' },
            { label: 'Green', className: 'green' },
            { label: 'Teal', className: 'teal' },
            { label: 'Cyan', className: 'cyan' },
            { label: 'Blue', className: 'blue', checked: true },
            { label: 'Indigo', className: 'indigo' },
            { label: 'Violet', className: 'violet' },
            { label: 'Fuchsia', className: 'fuchsia' },
            { label: 'Pink', className: 'pink' },
            { label: 'Graphite', className: 'graphite' },
        ],
    },
    ...,
];
```

**CSS:**

> 💡 **NOTE:** Depending on your component's View Encapsulation, you might need to place this CSS in your global stylesheet to affect the menu internals.

```css
a11y-menu .file-color {
    /**
     * The group of inline/grid items has the overflow set to auto.
     * Since we are gonna use a box-shadow to highlight the selected item,
     * we apply a small padding.
     */
    [menu-group-items] {
        gap: 5px;
        padding: 5px !important;
    }

    /* The actual item */
    [menu-item] {
        width: 30px;
        height: 30px;
        padding: 0;
        /**
         * Since we're going to use pastel colors, we need to apply a border to the items
         * to provide better contrast for color blind users
         */
        border: 2px solid color-mix(in oklch, var(--menu-item-bg-color), #000 40%);
        /* We override both (background & hover background) variables */
        --menu-item-bg-color: var(--bg);
        --menu-item-hover-bg-color: var(--bg);

        /* We hide the menu's "checked" state (default radio circle) */
        [menu-item-select] {
            display: none;
        }

        /**
         * We apply a custom "checked" SVG icon as the background of the item
         *
         * Using Font Awesome Free v6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2026 Fonticons, Inc.
         */
        &[aria-checked='true'] {
            background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg>');
            background-repeat: no-repeat;
            background-position: center;
            background-size: 70%;
        }

        /* Custom focus state */
        &:focus {
            outline: none;
            /* The second shadow is more perceivable in dark mode 😁 */
            box-shadow: 0 0 0 2px var(--a11y-bg-color-dark), 0 0 0 4px var(--menu-item-bg-color);
        }

        &.red      { --bg: #fee2e2; }
        &.orange   { --bg: #ffedd5; }
        &.amber    { --bg: #fef3c7; }
        &.yellow   { --bg: #fef9c3; }
        &.lime     { --bg: #ecfccb; }
        &.green    { --bg: #d1fae5; }
        &.teal     { --bg: #ccfbf1; }
        &.cyan     { --bg: #cffafe; }
        &.blue     { --bg: #dbeafe; }
        &.indigo   { --bg: #e0e7ff; }
        &.violet   { --bg: #f3e8ff; }
        &.fuchsia  { --bg: #fae8ff; }
        &.pink     { --bg: #fce7f3; }
        &.graphite { --bg: #f1f5f9; }
    }
}
```

**Result:**

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-custom-color-picker.jpg)

### The Busy State: Async Actions

When executing asynchronous operations, you can choose not to close the menu while the action takes place.

To provide the best user experience, you can leverage the item's **busy state**. This will display a _pulse_ animation and announce the state change to screen readers.

#### Default Animation & Dynamic Updates

For this example we'll create a dynamic "info" item so the user can have some visual context on what's happening while waiting.

> ⚠️ Remember that "info" items are completely skipped during navigation, they are purely for **visual** purposes.
>
> 💪 That's why you **have to** provide the same context to assistive technologies, using the `message` within the `setBusy()` method.

**Typescript:**

```typescript
myMenuItems: Menu = [
    {
        itemsLayout: 'inline',
        className: 'save-panel',
        items: [
            {
                info: 'Not saved',
                icon: 'fa-regular fa-circle-xmark text-danger',
                value: 'saved-info-item',
            },
            { separator: true },
            {
                label: 'Save',
                icon: 'fa-solid fa-cloud-arrow-up',
                // ⚠️ We establish not to close the menu after selecting the item
                closeOnSelect: false,
                action: async (itemCtx, menuCtx) => {
                    // 1. Set the info item relevant data
                    const info = menuCtx.getItemInfo('saved-info-item');
                    info?.update({
                        info: 'Saving...',
                        icon: 'fa-regular fa-hourglass text-danger fa-bounce',
                    });
                    // 2. Set the item's busy state with an initial message for screen reader users
                    itemCtx.setBusy(true, 'saving file');

                    try {
                        const fileSaved: boolean = await this.service.saveFile();

                        // 3.a. Success
                        if (fileSaved) {
                            // Remove busy state and announce success
                            itemCtx.setBusy(false, 'file saved successfully');
                            // Disable the "save" item
                            itemCtx.setDisabled(true);
                            // Update the "info" item
                            info?.update({
                                info: 'Saved',
                                icon: 'fa-solid fa-circle-check text-success',
                            });
                            return;
                        }

                        // 3.b. Failure: Remove busy state and announce failure
                        itemCtx.setBusy(false, 'failed to save the file');
                        // Update the "info" item
                        info?.update({
                            info: 'Failed to save!',
                            icon: 'fa-solid fa-triangle-exclamation text-danger',
                        });
                    } catch {
                        // 3.c. Exception: Remove busy state and announce failure
                        itemCtx.setBusy(false, 'an error occurred while saving');
                        // Update the "info" item
                        info?.update({
                            info: 'Failed to save!',
                            icon: 'fa-solid fa-triangle-exclamation text-danger',
                        });
                    }
                },
            },
            { label: 'Download', icon: 'fa-solid fa-download' },
        ],
    },
    ...,
];
```

**CSS:**

Since the items in the group are placed with "label below" by default, we need to override some CSS to display the _info item_ a bit nicer.

```css
/* We gain some specificity for the overriding */
a11y-menu [menu-group].save-panel [menu-group-items] [menu-item-info] {
    flex: 1;
    flex-direction: row;
    gap: 1rem;

    [menu-item-label] {
        text-align: start;
    }
}
```

**Result:**

For this example, we forced the action to pass. Notice how the menu remains open, the actioned item gets disabled after finishing, and the "info" item updates its state in the whole process.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-custom-info-loader.gif)

You can also see how the screen reader announces everything along the process.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-custom-info-loader-nvda.jpg)

#### Adding a Custom Loading Spinner

Continuing the example for [the custom icon component setup](#icons-setup-via-component-inputs), now you can provide your _loading_ state icon in the `iconDefaultLoader` property within your root config.

This will automatically display that icon the moment the item enters a _busy_ state.

**Root Config within the App Module:**

```typescript
A11yMenuModule.rootConfig({
    ...,
    iconDefaultLoader: 'fa-solid fa-spinner fa-spin',
}),
```

**Typescript:**

```typescript
myMenuItems: Menu = [
    ...,
    {
        label: 'Save',
        icon: 'fa-regular fa-floppy-disk',
        shortcut: { ctrlCmd: true, key: 'S' },
        // ⚠️ We establish not to close the menu after selecting the item
        closeOnSelect: false,
        action: async (itemCtx, menuCtx) => {
            // 1. Set the item's busy state with an initial message for screen reader users
            itemCtx.setBusy(true, 'saving file');

            try {
                const fileSaved: boolean = await this.service.saveFile();

                // 2.a. Success
                if (fileSaved) {
                    // Remove busy state and announce success
                    itemCtx.setBusy(false, 'file saved successfully');
                    // Close the menu manually since we disabled "closeOnSelect"
                    menuCtx.closeMenu();
                    return;
                }

                // 2.b. Failure: Remove busy state and announce failure
                itemCtx.setBusy(false, 'failed to save the file');
            } catch {
                // 2.c. Exception: Remove busy state and announce failure
                itemCtx.setBusy(false, 'an error occurred while saving');
            }
        },
    },
    ...,
];
```

**Result:**

For this example, we forced the action to fail. Notice how the menu remains open, the loading spinner disappears, and the item safely returns to its normal state.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-custom-icon-loader.gif)

#### The Busy State In Selectable Groups

Since checkbox or radio items have the "checked" status, you might need to validate the action prior to accept it.

For that, we use the [`beforeChange()` method](#the-beforechange-property) on the group.

This method will fire **before** the state changes, allowing you to execute any asynchronous validation and, therefore, accept or cancel the change by returning a `boolean`.

From the previous [Custom Color Picker example](#custom-color-picker), we add the method to the group and some extra CSS to provide a visual aid for the _waiting_.

**Typescript:**

```typescript
{
    type: 'radio',
    ...,
    beforeChange: (itemCtx, menuCtx, newState) => {
        // The "item" still contains the previous "checked" state
        const { label, checked } = itemCtx.item;
        // We block the call if the selected item was already checked
        // by "allowing" the update
        if (checked === newState) return true;
        // We check our backend
        return this.http.post('...').pipe(
            map(() => {
                // Success! We announce the chosen color
                menuCtx.announce(`Your item's color is now ${label}`);
                
                // Return true to authorize the menu to update the new state
                return true; 
            }),
            catchError(() => {
                // Error! We announce the failure
                menuCtx.announce('an error occurred while saving the color');
                
                // Return an observable of false to cancel the selection
                return of(false); 
            })
        );
    },
},
```

**CSS:**

```css
.file-color {
    [menu-item] {
        ...

        /* Loading animation */
        @keyframes color-loading {
            to {
                transform: rotate(360deg);
            }
        }

        /* Custom loading spinner for the "item-busy" */
        &[item-busy]::after {
            content: '';
            position: absolute;
            width: 70%;
            height: 70%;
            border-radius: 50%;
            border: 2px solid transparent;
            border-top-color: #000;
            animation: color-loading 0.8s linear infinite;
        }
    }
}
```

**Result:**

Notice how the entire group of items become _busy_, the loading spinner appears only in the activated item and, once the action is validated, all the items are safely returned to their normal state and the "checked" mark updates appropriately.

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/menu/src/lib/images/example-custom-color-picker-async.gif)
