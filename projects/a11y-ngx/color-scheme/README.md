# Color Scheme

An easy way to manage the defaults and custom Color Schemes for your components, libraries and web sites.

The purpose of this library is to allow your own components/libraries to implement the use of color schemes, so you can give the users the option to choose or update them as needed.

- All given Color Schemes will be added as new `<style>` tags within the `<head>` element.
- The default (`'light'`) or given Color Scheme will be established in the `<html>` tag.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Index

- [Installation](#installation)
- [The Types and Interfaces](#the-types-and-interfaces)
  - [The Color Scheme](#the-color-scheme)
  - [The Global Config](#the-global-config)
    - [Use Scheme](#the-global-config-use-scheme)
    - [Allow User to Change Scheme](#the-global-config-allow-user-to-change-scheme)
    - [New Schemes](#the-global-config-new-schemes)
      - [New Scheme Item](#the-global-config-new-scheme-item)
    - [Append Styles Map](#the-global-config-append-styles-map)
    - [Attribute Selector Match](#the-global-config-attribute-selector-match)
  - [The Color Scheme Config](#the-color-scheme-config)
    - [The Selector](#the-color-scheme-config-selector)
    - [The Styles Object](#the-color-scheme-config-styles-object)
    - [The Styles Map Object](#the-color-scheme-config-styles-map-object)
    - [The CSS Tag ID](#the-color-scheme-config-css-tag-id)
  - [The Color Scheme Styles Config](#the-color-scheme-config-styles-config)
    - [Force Scheme](#the-color-scheme-config-force-scheme)
    - [Use Bootstrap Styles](#the-color-scheme-config-use-bootstrap-styles)

- [The Service](#the-service)
  - [Public Methods, Properties, Getters and Setters](#the-service-public-methods-properties-getters-and-setters)
    - [Color Scheme Change](#the-service-color-scheme-change)
    - [User Chosen](#the-service-user-chosen)
    - [The `useBootstrapStyles()` Method](#the-service-usebootstrapstyles-method)
    - [The `getCurrentScheme()` Method](#the-service-getcurrentscheme-method)
    - [The `getConfig()` Method](#the-service-getconfig-method)
    - [The `setConfig()` Method](#the-service-setconfig-method)
    - [The `updateConfig()` Method](#the-service-updateconfig-method)
    - [The `getCustomStyles()` Method](#the-service-getcustomstyles-method)

- [The Components](#the-components)
  - [Dropdown Selector](#the-component-dropdown-selector)
  - [Checkbox](#the-component-checkbox)

- [Examples](#examples)
  - [The Attribute Selector Match Example](#the-attribute-selector-match-example)
  - [The Color Scheme Config Example](#the-color-scheme-config-example)
  - [The Default Names Example](#the-default-names-example)
  - [The New Schemes Example](#the-new-schemes-example)
  - [Get Custom Styles Example](#get-custom-styles-example)

## Installation

1. Install npm package:

   `npm install @a11y-ngx/color-scheme --save`

2. Import `A11yColorSchemeModule` into your module:

```typescript
import { A11yColorSchemeModule } from '@a11y-ngx/color-scheme';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yColorSchemeModule
    ]
})
export class AppModule { }
```

> **CHECK ALSO:** The [rootConfig()](#the-rootconfig-method) and [setColorScheme()](#the-setcolorscheme-method) methods.

### The `rootConfig()` Method

Serves the purpose of configuring the basics for the entire Color Scheme system within your website.

> ⚠️ **IMPORTANT:** It's not meant to be used within a component/library. For that, please use [the `setColorScheme()` method](#the-setcolorscheme-method).

Accepts a single parameter `config` of type [`ColorScheme`](#the-color-scheme) or the [`ColorSchemeGlobalConfig`](#the-global-config) object.

```typescript
A11yColorSchemeModule.rootConfig('dark'),
// or...
A11yColorSchemeModule.rootConfig({
    useScheme: 'dark',
    ...
}),
```

### The `setColorScheme()` Method

Serves to establish one or more sub level configurations based on a given `selector`.

This comes handy when you need to add a custom set of properties and styles for the Color Scheme on a particular component or library.

Accepts a single parameter `config` of type [`ColorSchemeConfig`](#the-color-scheme-config) or an array of them, so you can configure multiple selectors.

```typescript
A11yColorSchemeModule.setColorScheme({
    selector: 'my-custom-library',
    ...
}),
```

## The Types and Interfaces

### The Color Scheme

- **Type:** `ColorScheme`.
- **Of type:** `string`, it accepts the values:
  - **Generics:** `'light'`, `'dark'` or `'auto'` (defined by the system).
  - **Custom:** Any given code-name from the new custom Color Scheme.

### The Global Config

- Type: `ColorSchemeGlobalConfig`.
- Properties:
  - [`useScheme`](#the-global-config-use-scheme).
  - [`allowUserToChangeScheme`](#the-global-config-allow-user-to-change-scheme).
  - [`defaultNames`](#the-global-config-default-names).
  - [`newSchemes`](#the-global-config-new-schemes).
  - [`appendStylesMap`](#the-global-config-append-styles-map).
  - [`attributeSelectorMatch`](#the-global-config-attribute-selector-match).

<a name="global-config-basic-properties"></a>
The global configuration comes with a set of basic properties of CSS variables ready to be used:

| Property | CSS Variable | Light | Dark |
|:---------|:-------------|:------|:-----|
| `a11yBackgroundColor`| `--a11y-bg-color` | `'rgb(255 255 255 / 98%)'` | `'rgb(31 31 31 / 98%)'` |
| `a11yTextColor`| `--a11y-text-color` | `'#222'` | `'#FFF'` |
| `a11yBorderColor`| `--a11y-border-color` | `'#656565'` | `'#555'` |
| `a11yShadow`| `--a11y-shadow` | `'5px 5px 10px -5px'` | `'5px 5px 10px -5px'` |
| `a11yShadowColor` | `--a11y-shadow-color` | `'#444'` | `'#444'` |
| `a11yFocusVisible`| `--a11y-focus-visible` | `'0 0 0 2px #FFF, 0 0 0 4px #444'` | `'0 0 0 2px #555, 0 0 0 4px #FFF'` |

#### The Global Config: Use Scheme

To set which Color Scheme to be used.

- **Config Property:** `useScheme` (_optional_).
- **Type:** [`ColorScheme`](#the-color-scheme).
- **Default:** `'light'`.

#### The Global Config: Allow User to Change Scheme

To allow the user to change the Color Scheme.

- **Config Property:** `allowUserToChangeScheme` (_optional_).
- **Type:** `boolean`.
- **Default:** `true`.

#### The Global Config: Default Names

To set the default names for the basic Color Schemes: `light`, `dark` or `auto`, all of type `string`.

See [the Default Names Example](#the-default-names-example).

- **Config Property:** `defaultNames` (_optional_).
- **Type:** `ColorSchemeDefaultNames`.
- **Default:** `{}` (_unset_).

#### The Global Config: New Schemes

To provide new Color Schemes.

- **Config Property:** `newSchemes` (_optional_).
- **Type:** [`ColorSchemeItem[]`](#the-global-config-new-scheme-item).
- **Default:** `[]`.

##### The Global Config: New Scheme Item

The new Scheme item.

- **Type:** `ColorSchemeItem`.
- **Properties:**
  - `value` of type [`ColorScheme`](#the-color-scheme): The unique code-name (hyphen separated, preferably) of the Color Scheme.
  - `name` of type `string`: The readable name of the Color Scheme.
  - `scheme` of type [`ColorSchemeProperties`](#color-scheme-properties-type): The properties for the Color Scheme.

Check [the New Schemes example](#the-new-schemes-example).

#### The Global Config: Append Styles Map

To provide new properties to the current styles map. See [the basic properties within the styles map](#global-config-basic-properties).

> **IMPORTANT:** The current properties values are not going to be override, since they are being used by other libraries.

- **Config Property:** `appendStylesMap` (_optional_).
- **Type:** [`ColorSchemeCSSMap`](#the-color-scheme-config-styles-map-object).

#### The Global Config: Attribute Selector Match

The CSS attribute's name to match the Color Scheme.

- **Config Property:** `attributeSelectorMatch` (_optional_).
- **Type:** `string`.
- **Default:** `'color-scheme'`.

As mentioned above, the default is set to `'color-scheme'`, which will result on `color-scheme="..."` applied to the `<html>` element.

Check [the Attribute Selector Match example](#the-attribute-selector-match-example).

### The Color Scheme Config

Used inside [the `setColorScheme()` method](#the-setcolorscheme-method), it serves the purpose of configuring the Color Scheme for a new component or library based on a given `selector`.

- Type: `ColorSchemeConfig`.
- Properties:
  - [`selector`](#the-color-scheme-config-selector).
  - [`styles`](#the-color-scheme-config-styles-object).
  - [`stylesMap`](#the-color-scheme-config-styles-map-object).
  - [`cssTagID`](#the-color-scheme-config-css-tag-id).
  - It also implements the properties from [the Styles Config type](#the-color-scheme-config-styles-config).
    - [`forceScheme`](#the-color-scheme-config-force-scheme).
    - [`useBootstrapStyles`](#the-color-scheme-config-use-bootstrap-styles).

Check [the Color Scheme Config example](#the-color-scheme-config-example).

#### The Color Scheme Config: Selector

The element selector to apply the Color Scheme config to.

- **Config Property:** `selector`.
- **Type:** `string`.

#### The Color Scheme Config: Styles Object

An object with the properties and values for each style your component/library needs.

- **Config Property:** `styles`.
- **Type:** `ColorSchemeProperties` or `ColorSchemesObject`.

<a name="color-scheme-properties-type"></a>
The `ColorSchemeProperties` is a basic group of properties, it won't contain individual schemes. It will serve the sole purpose of create a _root_ set of CSS properties.

```typescript
const STYLES: ColorSchemeProperties = {
    backgroundColor: '#DDD',
    textColor: '#999',
    borderSize: 1,
    fadeMs: 200,
};
```

<a name="color-scheme-object-type"></a>
The `ColorSchemesObject` is a more complex group of properties, which will contain generic items as well as individual schemes.

**Properties:**

- `generics` of type `ColorSchemeProperties`:
  - In here we can add those properties that are generic (not color related).
- `schemes` of type `ColorSchemes`:
  - In here we have to specify each color scheme by its code-name and, within, its properties (of type `ColorSchemeProperties`):
    - `light` is mandatory, since it will be used as the default scheme.
    - `dark` is optional.
    - _'code-name'_ also optional, you can add as many custom color schemes as you need.

```typescript
const STYLES: ColorSchemesObject = {
    generics: {
        borderSize: 1,
        fadeMs: 200,
    },
    schemes: {
        light: { // mandatory
            backgroundColor: '#DDD',
            textColor: '#999',
        },
        dark: {}, // optional
        red: {}, // being 'red' the code-name
        blue: {}, // being 'blue' the code-name
    },
};
```

#### The Color Scheme Config: Styles Map Object

The properties to map within each config.

- **Config Property:** `stylesMap`.
- **Type:** `ColorSchemeCSSMap`.
  - The property will be a string of your choosing.
  - The value could be:
    - `string`: The property to map.
    - `ColorSchemeCSSProperty`: It's an object that could contain:
      - `property` of type `string`: The property to map.
      - `suffix` (_optional_) of type `string`: The _suffix_ to apply to the CSS property.
      - `ignoreIfUsingBS` (_optional_) of type `boolean`: Read the note below.

> **NOTE:** The use of `ignoreIfUsingBS` applies only if you are allowing the use of Bootstrap and/or custom styles, then you allow the property to be ignored in case `useBootstrapStyles` was set to `true` within [the Color Scheme Config](#the-color-scheme-config).

- The map will be conformed by a list of properties and their values.
- Those values will be applied as the final CSS property, meaning that you can either use `'background-color'` or, as a variable, `'--bg-color'`.
- For those values that you need to be numeric, for internal calculation purposes, but applied as "px" or "ms" in the final CSS, you can make use of the `suffix`. See the use of `borderSize` and `fadeMs` in [the Color Scheme Config Example](#the-color-scheme-config-example).

#### The Color Scheme Config: CSS Tag ID

The ID to apply to the `<style>` tag.

> **NOTE:** If no value is passed, a generic one will be assigned based on the selector provided.

- **Config Property:** `cssTagID` (_optional_).
- **Type:** `string`.

### The Color Scheme Config: Styles Config

This type is meant to be implemented within a custom library, so you can give the user the power to choose among two more options.

- **Type:** `ColorSchemeStylesConfig`.
- **Properties:**
  - [`forceScheme`](#the-color-scheme-config-force-scheme).
  - [`useBootstrapStyles`](#the-color-scheme-config-use-bootstrap-styles).

#### The Color Scheme Config: Force Scheme

To force the use of the given Color Scheme.

- **Config Property:** `forceScheme`.
- **Type:** [`ColorScheme`](#the-color-scheme).

#### The Color Scheme Config: Use Bootstrap Styles

Whether it will use Bootstrap 5.3 (or above) styles or custom.

- **Config Property:** `useBootstrapStyles`.
- **Type:** `boolean`.

## The Service

### The Service: Public Methods, Properties, Getters and Setters

| Name | Type | Of Type | Description |
|:-----|:-----|:--------|:------------|
| `colorSchemeChanged` | `property` | `BehaviorSubject<ColorSchemeChange>` | See [the Color Scheme Change](#the-service-color-scheme-change)  |
| `colorSchemes` | `get` | [`ColorSchemeItem[]`](#the-global-config-new-scheme-item) | The configured color schemes |
| `userChosen` | `get`/`set` | [`ColorScheme`](#the-color-scheme) | See [the Service: User Chosen](#the-service-user-chosen) |
| `allowUserToChangeScheme` | `get` | `boolean` | See [the Config: Allow User to Change Scheme](#the-global-config-allow-user-to-change-scheme) |
| `rootConfig` | `get` | [`ColorSchemeConfig`](#the-color-scheme-config) | The root (global) configuration |
| `useBootstrapStyles()` | `method` | `boolean` | See [Use Bootstrap Styles method](#the-service-usebootstrapstyles-method) |
| `getCurrentScheme()` | `method` | [`ColorSchemeProperties`](#color-scheme-properties-type) | See [Get Current Scheme method](#the-service-getcurrentscheme-method) |
| `getConfig()` | `method` | [`ColorSchemeConfig`](#the-color-scheme-config) | See [the Get Config method](#the-service-getconfig-method) |
| `setConfig()` | `method` | `void` | See [the Set Config method](#the-service-setconfig-method) |
| `updateConfig()` | `method` | `void` | See [the Update Config method](#the-service-updateconfig-method) |
| `getCustomStyles()` | `method` | `CSSStyleDeclaration` | See [the Get Custom Styles method](#the-service-getcustomstyles-method) |

#### The Service: Color Scheme Change

To subscribe and get notified when the color scheme has changed, either by the user or the system.

- **Property:** `colorSchemeChanged`.
- **Type:** `ColorSchemeChange`.
- **Properties:**
  - `colorSchemePrevious` of type [`ColorScheme`](#the-color-scheme): The previous scheme.
  - `colorSchemeCurrent` of type [`ColorScheme`](#the-color-scheme): The current scheme.
  - `changedBy` of type `'user'` or `'system'`: Who changed the scheme.

#### The Service: User Chosen

The color scheme the user has chosen.

- **Property:** `userChosen`.
- **Type:** `ColorSchemeChange`.
  - **Get:** Either the code-name of the chosen color scheme or `auto`, which means that will use the system's.
  - **Set:** To set what the user has chosen.
    - If `'auto'` is set (as by default):
      - The current system scheme will be applied.
      - An event listener will start listening for changes from the system to apply it as soon as it gets triggered.
    - If a _code-name_ is set:
      - The event listener will be stopped.

#### The Service: `useBootstrapStyles()` Method

To know whether the given selector was configured to use Bootstrap styles or not. See [the Config: Use Bootstrap Styles](#the-color-scheme-config-use-bootstrap-styles).

Accepts a single parameter `selector` of type `string` and returns a `boolean`.

#### The Service: `getCurrentScheme()` Method

To get the current Color Scheme values for a given selector.

Accepts a single parameter `selector` of type `string` and returns an object with all the properties of the scheme of type [`ColorSchemeProperties`](#color-scheme-properties-type).

#### The Service: `getConfig()` Method

To get the config from a given selector.

Accepts a single parameter `selector` of type `string` and returns the config object of type [`ColorSchemeConfig`](#the-color-scheme-config).

#### The Service: `setConfig()` Method

To set a new config.

Accepts a single parameter `config` of type [`ColorSchemeConfig`](#the-color-scheme-config).

#### The Service: `updateConfig()` Method

To update a config with new values from a given selector.

If you are creating your own component/library with custom color schemes, you can use this method to update it whenever you need.

Accepts three parameters:

- `selector` of type `string`.
- `config` of type `any`, [`ColorSchemeProperties`](#color-scheme-properties-type) or [`ColorSchemesObject`](#color-scheme-object-type).
- `colorSchemesProperty` (_optional_) of type `string`:
  - To specify a custom property within the given `config` (if type `any` was provided) to search for the properties to update.

#### The Service: `getCustomStyles()` Method

Process and returns a string with all the CSS properties and values ready to be inserted in the `style` property of an element.

The method accepts two parameters:

- `selector` of type `string`.
- `customConfig` of type [`ColorSchemeProperties`](#color-scheme-properties-type).

This serves the purpose to allow the user to customize a single instance of that selector, while the rest will use the global values set for it.

> **NOTE:** If within the `customConfig`, one or more of the values are equal to the global's, they will be ignored and won't be returned, since they are already set in the `<style>` tag created when [the `setColorScheme()` method](#the-setcolorscheme-method) was invoked the first time.

Check [the Get Custom Styles example](#get-custom-styles-example).

## The Components

Two basic components to allow the user to change the Color Scheme on the page.

> **NOTE:** For both components:
>
> - The `disabled` state will depend not only on the `@Input()` but also on the [`allowUserToChangeScheme`](#the-global-config-allow-user-to-change-scheme) property set on the global config.
> - The `useBootstrapStyles` will make use of the class names within Bootstrap 5.3 (or above) so, in case you are using it within your site, either of the components will look with those styles.

### The Component: Dropdown Selector

A simple dropdown selector to allow the user to choose between any of the basic, custom or auto (System's) schemes.

- **Selector:** `'a11y-color-scheme-select'`.
- **Inputs:**
  | Name | Type | Default |
  |:-----|:-----|:--------|
  | `label` | `string` | `'Color Scheme'` |
  | `disabled` | `boolean` | `false` |
  | `useBootstrapStyles` | `boolean` | `false` |

#### Dropdown Selector - Default Use

```html
<a11y-color-scheme-select>
</a11y-color-scheme-select>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-select-default-light.jpg)

#### Dropdown Selector - Custom Label

For this example, two new Color Schemes were added using [the Global Config New Schemes](#the-global-config-new-schemes) (see also [the New Schemes Example](#the-new-schemes-example)).

```html
<a11y-color-scheme-select label="Pick a Scheme">
</a11y-color-scheme-select>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-select-custom-light.jpg)

#### Dropdown Selector - Using Bootstrap

```html
<a11y-color-scheme-select
    label="Pick a Scheme"
    [useBootstrapStyles]="true">
</a11y-color-scheme-select>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-select-custom-bs-light.jpg)

### The Component: Checkbox

A simple checkbox to allow the user to choose between `light` or `dark` schemes.

- **Selector:** `'a11y-color-scheme-checkbox'`.
- **Inputs:**
  | Name | Type | Default |
  |:-----|:-----|:--------|
  | `label` | `string` | `'Dark Mode'` |
  | `disabled` | `boolean` | `false` |
  | `useBootstrapStyles` | `boolean` | `false` |

#### Checkbox - Default Use

```html
<a11y-color-scheme-checkbox>
</a11y-color-scheme-checkbox>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-checkbox-default-light.jpg)

```html
<a11y-color-scheme-checkbox [disabled]="true">
</a11y-color-scheme-checkbox>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-checkbox-default-disabled-light.jpg)

#### Checkbox - Using Bootstrap

```html
<a11y-color-scheme-checkbox [useBootstrapStyles]="true">
</a11y-color-scheme-checkbox>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-checkbox-default-bs-light.jpg)

## Examples

### The Attribute Selector Match Example

> **NOTE:** If you are using Bootstrap 5.3 (or above), they make use of `'data-bs-theme'` attribute selector, so you can change it to that value.

Let's say you want to define the default scheme to `'dark'`:

```typescript
A11yColorSchemeModule.rootConfig('dark'),
```

```html
<html lang="en" color-scheme="dark">
    ...
</html>
```

Now, you want to implement your own custom CSS selector for your themes called `'current-theme'` and set the default scheme as `'red-velvet'`:

```typescript
A11yColorSchemeModule.rootConfig({
    useScheme: 'red-velvet',
    attributeSelectorMatch: 'current-theme'
}),
```

```html
<html lang="en" current-theme="red-velvet">
    ...
</html>
```

### The Color Scheme Config Example

Let's say you want to create a library with custom background color, text color, fade timeout and border size for each of your schemes (`light`, `dark` and `red-velvet`), you should create the styles and map objects as follows:

**The Styles Object:**

> **NOTE:** Remember that, in this case, the _border size_ and _fade timeout_ are generic to your styles, you can set them into the `generics` group and the rest, since they are color related, into the `schemes` group. See the [`ColorSchemesObject`](#color-scheme-object-type).

```typescript
const STYLES: ColorSchemesObject = {
    generics: {
        borderSize: 1,
        fadeMs: 200,
    }
    schemes: {
        light: {
            backgroundColor: '#DDD',
            textColor: '#999',
        },
        dark: {
            backgroundColor: '#999',
            textColor: '#DDD',
        },
        'red-velvet': {
            backgroundColor: '#BE1F31',
            textColor: '#FFD9A1',
        },
    }
};
```

**The Styles Map Object:**

> **NOTE:** You can use the value as a normal CSS property like `border-width` or as a variable name, like `--bg-color`.

```typescript
const STYLES_MAP: ColorSchemeCSSMap = {
    backgroundColor: '--bg-color',
    textColor: '--txt-color',
    borderSize: {
        property: 'border-width',
        suffix: 'px',
    },
    fadeMs: {
        property: '--fade-ms',
        suffix: 'ms',
    },
}
```

**The Import of the Color Scheme Module in your Library:**

```typescript
A11yColorSchemeModule.setColorScheme({
    selector: 'my-custom-component',
    styles: STYLES,
    stylesMap: STYLES_MAP,
    cssTagID: 'my-custom-component-styles',
}),
```

**The Styles Results:**

```html
<style id="my-custom-component-styles">
/* Light Color Scheme */
my-custom-component {
    --bg-color: #DDD;
    --txt-color: #999;
    --fade-ms: 250ms;
    border-width: 1px;
}
/* Dark Color Scheme */
[color-scheme="dark"] my-custom-component {
    color-scheme: dark;
    --bg-color: #999;
    --txt-color: #DDD;
}
/* Red Velvet Color Scheme */
[color-scheme="red-velvet"] my-custom-component {
    color-scheme: normal;
    --bg-color: #BE1F31;
    --txt-color: #FFD9A1;
}
</style>
```

### The Default Names Example

Lets say your website is in spanish, so you want to provide the right translation for the generic names for when you use [the Dropdown Selector component](#the-component-dropdown-selector) or at any moment you want to consume the configured color schemes list of items by using the `colorSchemes` getter from [the service](#the-service-public-methods-properties-getters-and-setters).

```typescript
A11yColorSchemeModule.rootConfig({
    defaultNames: {
        light: 'Claro',
        dark: 'Oscuro',
        auto: 'Igual al Sistema',
    },
}),
```

```html
<a11y-color-scheme-select label="Esquema de Color">
</a11y-color-scheme-select>
```

![""](https://raw.githubusercontent.com/LDV2k3/a11y-libraries/fd4c7b35a5124c0aa72c4b6dcd8cb45695c93a9b/projects/a11y-ngx/color-scheme/src/lib/images/example-select-spanish-light.jpg)

### The New Schemes Example

Now you want to define a new color scheme "Red Velvet" for your project and use it as default:

```typescript
A11yColorSchemeModule.rootConfig({
    useScheme: 'red-velvet', // to use it as default
    newSchemes: [
        {
            value: 'red-velvet',
            name: 'Red Velvet',
            scheme: {
                a11yBackgroundColor: '#A1C5EA',
                a11yTextColor: '#001D6C',
                ...
            },
        }
    ],
}),
```

### Get Custom Styles Example

Lets continue with [the Color Scheme Config example](#the-color-scheme-config-example).

In your component, you are allowing three inputs:

```typescript
@Input() bgColor: string;
@Input() textColor: string;
@Input() fadeMs: number;
```

Now, when the view inits, you can establish those custom styles to your main element:

```typescript
@HostBinding('style') private customVariables: CSSStyleDeclaration;

constructor(private colorSchemeService: ColorSchemeService) {}

ngAfterViewInit(): void {
    const config = {
        // remember that the config's property needs to match the one
        // from the styles map you established when using setColorScheme()
        backgroundColor: this.bgColor,
        textColor: this.textColor,
        fadeMs: this.fadeMs,
    } as ColorSchemeProperties;

    this.customVariables = this.colorSchemeService.getCustomStyles(
        'my-custom-component',
        config
    );
}
```

This way, when the user sets the values for each input as:

```html
<my-custom-component
    backgroundColor="#000"
    textColor="white"
    fadeMs="300">
</my-custom-component>
```

Your main component will be rendered as follows:

```html
<my-custom-component style="
    --bg-color: #000;
    --txt-color: white;
    --fade-ms: 300ms;">
</my-custom-component>
```

...and your stylesheet will do the rest, since you are using CSS variables and will take those from this specific instance of the component.
