# A11y Theme

A lightweight, centralized theming engine for the `@a11y-ngx` ecosystem.

This library manages the basic global theme state (Light & Dark) and exposes a core set of CSS variables used by all other `@a11y-ngx` components. By installing and configuring this once, your entire accessible UI ecosystem stays visually synced.

> ⚠️ **IMPORTANT:** This is a "headless" provider. By itself, it does not style your application HTML. It simply provides the state and CSS tokens that the rest of the `@a11y-ngx` libraries listen to in order to adapt their colors.
>
> ♿ **Contrast Compliance:** All active text and background color combinations strictly adhere to the WCAG AA minimum contrast ratio of 4.5:1. As per WCAG guidelines, "disabled" tokens intentionally use a lower contrast to visually communicate inactivity.

![Angular support from version 12 up to version 21](https://img.shields.io/badge/Angular-v12_to_v21-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v21.

## Changelog

See the complete [changelog](https://github.com/LDV2k3/a11y-libraries/blob/master/projects/a11y-ngx/theme/CHANGELOG.md) for details on updates and breaking changes.

## Index

- [Installation](#installation)
- [Setup](#setup)
- [Available CSS Tokens](#available-css-tokens)
- [Service](#service)

## Installation

`npm install @a11y-ngx/theme`

## Setup

How you initialize the theme depends on whether you are configuring an application or building a library, please refer to:

- [For Application Developers](#for-application-developers)
- [For Library Authors](#for-library-authors)

### For Application Developers

If you are integrating the `@a11y-ngx` ecosystem into your app, use the module's `rootConfig()` method or `provideA11yTheme()` at your root level.

This will inject the base CSS tokens into the DOM and set the active theme state (when provided) for the rest of the libraries that will consume it.

> 💡 **NOTE:** Not providing a value will fall back to the user system's color scheme configuration.

Both the method and the provider accept a single parameter `theme` of type `'light'` or `'dark'`.

**On Angular v12 - v14:**

```typescript
import { A11yThemeModule } from '@a11y-ngx/theme';

@NgModule({
    imports: [
        A11yThemeModule.rootConfig('light'),
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

### For Library Authors

If you are building a library that relies on these CSS tokens, you only need to import the `A11yThemeModule`.

Importing the module only triggers the creation of the base `<style>` tag in the DOM. It does not force a specific theme state, leaving that decision to the end-user's application.

```typescript
import { A11yThemeModule } from '@a11y-ngx/theme';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yThemeModule,
    ],
})
export class YourLibModule { }
```

## Available CSS Tokens

When the lib is initialized, it injects the following CSS variables globally. Other `@a11y-ngx` libraries automatically inherit these values, but you can also use them directly in your own application styles for a cohesive UI.

> 💡 **NOTE 1:** You can override these base tokens in your global `styles.css` if you want to apply a custom color palette across the entire `@a11y-ngx` ecosystem.
>
> 💡 **NOTE 2:** Behind the scenes, every color in the table is managed by three variables. The library leverages the native CSS `light-dark()` function to expose a single, unified token for your UI.
>
> Just as an example, the background color is structured like this:
>
> ```css
> --a11y-bg-color-light: #ffffff;
> --a11y-bg-color-dark: #1e1e1e;
> 
> /* The unified token consumed by the ecosystem */
> --a11y-bg-color: light-dark(var(--a11y-bg-color-light), var(--a11y-bg-color-dark));
> ```
>
> What this means for you:
>
> - **To consume a color:** Use the unified token (e.g., `var(--a11y-bg-color)`) in your custom wrappers. It will automatically switch based on the active theme.
> - **To override a color:** Target the specific mode tokens (e.g., `--a11y-bg-color-light` or `--a11y-bg-color-dark`) in your global styles to alter the palette.

**Color Tokens:**

| Variable | Light | Dark |
| :------- | :---: | :--: |
| `--a11y-bg-color` | `rgb(255 255 255 / 98%)` | `rgb(31 31 31 / 98%)` |
| `--a11y-text-color` | `#222` | `#fff` |
| `--a11y-text-color-secondary` | `#5f5f5f` | `#bcbcbc` |
| `--a11y-border-color` | `#656565` | `#666` |
| `--a11y-shadow-color` | `#444` | `#444` |
| `--a11y-focus-visible-shadow` | `0 0 0 2px #fff, 0 0 0 4px #444` | `0 0 0 2px #fff, 0 0 0 4px #666` |
| `--a11y-focus-visible-outline` | `#7d7d7d` | `#828282` |
| `--a11y-hover-bg-color` | `#ddd` | `#393939` |
| `--a11y-hover-text-color` | `var(--a11y-text-color-light)` | `var(--a11y-text-color-dark)` |
| `--a11y-disabled-bg-color` | `transparent` | `transparent` |
| `--a11y-disabled-text-color` | `#949494` | `#7a7a7a` |
| `--a11y-disabled-hover-bg-color` | `var(--a11y-hover-bg-color-light)` | `var(--a11y-hover-bg-color-dark)` |

**Generic Tokens:**

| Variable | Value |
| :------- | :---: |
| `--a11y-shadow` | `5px 5px 10px -5px` |
| `--a11y-focus-visible-outline-size` | `2px` |

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/theme/src/lib/images/example-theme-light.jpg)

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/refs/heads/master/projects/a11y-ngx/theme/src/lib/images/example-theme-dark.jpg)

## Service

Use the `ThemeService` within your custom components or libraries to retrieve the specific theme preference explicitly chosen by the user.

> 💡 **NOTE:** If the user did not provide a configuration (meaning the app is falling back to the system's default), the getter will return `undefined`.

**Your Component:**

```typescript
import { Component, inject } from '@angular/core';
import { ThemeService } from '@a11y-ngx/theme';

@Component({
    // ...
    host: {
        '[attr.theme]': 'themeService.theme ?? null',
    },
})
export class MyComponent {
    protected themeService = inject(ThemeService);
    ...
}
```

**Your Component's CSS:**

```css
:host {
    &[theme='light'] {
        color-scheme: light;
    }
    &[theme='dark'] {
        color-scheme: dark;
    }

    background-color: var(--a11y-bg-color);
    color: var(--a11y-text-color);
    ...
}
```
