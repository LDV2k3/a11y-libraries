# DOM Helper

Another set of tools to validate DOM stuff.

![Angular support from version 12 up to version 20](https://img.shields.io/badge/Angular-v12_to_v20-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v20.

## Index

- [Installation](#installation)
- [Methods](#methods)
  - [The `getStyles()` Method](#the-getstyles-method)
  - [The `getStyle()` Method](#the-getstyle-method)
    - [The `getStyleBefore()` Method](#the-getstylebefore-method)
    - [The `getStyleAfter()` Method](#the-getstyleafter-method)
  - [The `isVisible()` Method](#the-isvisible-method)
  - [The `isAriaHidden()` Method](#the-isariahidden-method)
  - [The `isInert()` Method](#the-isinert-method)
  - [The `isBoolean()` Method](#the-isboolean-method)
  - [The `isNumeric()` Method](#the-isnumeric-method)
  - [The `hasAttribute()` Method](#the-hasattribute-method)
  - [The `getAttributeValue()` Method](#the-getattributevalue-method)
  - [The `getAttributeNumericValue()` Method](#the-getattributenumericvalue-method)
  - [The `getBooleanValue()` Method](#the-getbooleanvalue-method)
  - [The `getNumericValue()` Method](#the-getnumericvalue-method)
  - [The `tabbableElements()` Method](#the-tabbableelements-method)
  - [The `isImageElement()` Method](#the-isimageelement-method)
  - [The `isInteractiveElement()` Method](#the-isinteractiveelement-method)
  - [The `canBeAriaLabelled()` Method](#the-canbearialabelled-method)

## Installation

1. Install npm package:

   `npm install @a11y-ngx/dom-helper --save`

2. Import `DOMHelperService` into your typescript file:

```typescript
import { DOMHelperService } from '@a11y-ngx/dom-helper';

constructor(private DOMHelper: DOMHelperService) {}
```

## Methods

### The `getStyles()` Method

To get all the element's computed styles.

Accepts two parameters:

- `element` of type `HTMLElement`.
- `pseudoElement` (_optional_) of type `string`.

```typescript
this.DOMHelper.getStyles(element, '::before');
```

### The `getStyle()` Method

To get the property's value from the element's computed styles.

Accepts three parameters:

- `element` of type `HTMLElement`.
- `property` of type `keyof CSSStyleDeclaration`.
- `pseudoElement` (_optional_) of type `string`.

```typescript
this.DOMHelper.getStyle(element, 'visibility'); // => 'visible' / 'hidden' / etc.
```

#### The `getStyleBefore()` Method

A shortcut of the `getStyle()` method to get the property's `::before` pseudo element computed style.

Accepts two parameters:

- `element` of type `HTMLElement`.
- `property` of type `keyof CSSStyleDeclaration`.

```typescript
this.DOMHelper.getStyleBefore(element, 'position'); // => 'absolute' / 'relative' / etc.
```

#### The `getStyleAfter()` Method

A shortcut of the `getStyle()` method to get the property's `::after` pseudo element computed style.

Accepts two parameters:

- `element` of type `HTMLElement`.
- `property` of type `keyof CSSStyleDeclaration`.

```typescript
this.DOMHelper.getStyleAfter(element, 'zIndex'); // => '100' / etc.
```

### The `isVisible()` Method

To check for the element's visibility.

It will check for:

- The absence of `aria-hidden` attribute set to `true`.
- The absence of `inert` attribute.
- The element has size (width **and** height).
- The element has `visibility` set to `'visible'`.

Accepts a single parameter `element` of type `HTMLElement` and returns a `boolean`.

```typescript
this.DOMHelper.isVisible(element); // => true / false
```

### The `isAriaHidden()` Method

To check if the `aria-hidden` attribute is set to `true`.

Accepts a single parameter `element` of type `HTMLElement` and returns a `boolean`.

```typescript
this.DOMHelper.isAriaHidden(element); // => true / false
```

### The `isInert()` Method

To check if the `inert` attribute is present.

Accepts a single parameter `element` of type `HTMLElement` and returns a `boolean`.

```typescript
this.DOMHelper.isInert(element); // => true / false
```

### The `isBoolean()` Method

To check if the given value is boolean or not.

Accepts a single parameter `value` of type `unknown` and returns a `boolean`.

```typescript
this.DOMHelper.isBoolean('value');   // => false
this.DOMHelper.isBoolean(undefined); // => false
this.DOMHelper.isBoolean(0);         // => false
this.DOMHelper.isBoolean(!0);        // => true
this.DOMHelper.isBoolean('true');    // => true
this.DOMHelper.isBoolean('false');   // => true
this.DOMHelper.isBoolean(false);     // => true
```

### The `isNumeric()` Method

To check if the given value is numeric or not.

Accepts a single parameter `value` of type `unknown` and returns a `boolean`.

```typescript
this.DOMHelper.isNumeric('');         // => false
this.DOMHelper.isNumeric(NaN);        // => false
this.DOMHelper.isNumeric('123,25');   // => false
this.DOMHelper.isNumeric(' 123 ');    // => true
this.DOMHelper.isNumeric(' 123.25 '); // => true
this.DOMHelper.isNumeric(123);        // => true
```

### The `hasAttribute()` Method

To check if the given attribute is present in the element.

Accepts two parameters:

- `element` of type `HTMLElement`.
- `attribute` of type `string`.

It will return a `boolean` confirming whether the attribute exists or not.

```typescript
this.DOMHelper.hasAttribute(element, 'disabled'); // => true / false
```

### The `getAttributeValue()` Method

To get the value from an attribute.

Accepts two parameters:

- `element` of type `HTMLElement`.
- `attribute` of type `string`.

It will return the value as a `string` or `null` otherwise.

```typescript
this.DOMHelper.getAttributeValue(element, 'type');     // => 'button' / 'checkbox' / etc.
this.DOMHelper.getAttributeValue(element, 'tabindex'); // => '-1' / null
```

### The `getAttributeNumericValue()` Method

To check and get the numeric value from an attribute.

Accepts three parameters:

- `element` of type `HTMLElement`.
- `attribute` of type `string`.
- `decimals` (_optional_) of type `number`. When _unset_, it will keep all available decimals.

It will make use of the `isNumeric()` method to verify that the value _is_ numeric and return it as a `number` or `null` otherwise.

```typescript
this.DOMHelper.getAttributeNumericValue(element, 'tabindex'); // => -1 / null
```

### The `getBooleanValue()` Method

To check and get the boolean value.

Accepts a single parameter `value` of type `unknown`.

It will make use of the `isBoolean()` method to verify that the value _is_ boolean and return it as a `boolean` or `null` otherwise.

```typescript
this.DOMHelper.getBooleanValue('value');   // => null
this.DOMHelper.getBooleanValue(undefined); // => null
this.DOMHelper.getBooleanValue(0);         // => null
this.DOMHelper.getBooleanValue('false');   // => false
this.DOMHelper.getBooleanValue(false);     // => false
this.DOMHelper.getBooleanValue(' true ');  // => true
```

### The `getNumericValue()` Method

To check and get the numeric value.

Accepts two parameters:

- `value` of type `unknown`.
- `decimals` (_optional_) of type `number`. When _unset_, it will keep all available decimals.

It will make use of the `isNumeric()` method to verify that the value _is_ numeric and return it as a `number` or `null` otherwise.

```typescript
this.DOMHelper.getNumericValue('');           // => null
this.DOMHelper.getNumericValue('value');      // => null
this.DOMHelper.getNumericValue(NaN);          // => null
this.DOMHelper.getNumericValue(true);         // => null
this.DOMHelper.getNumericValue(' 123 ');      // => 123
this.DOMHelper.getNumericValue('123.25');     // => 123.25
this.DOMHelper.getNumericValue('123.25', 1);  // => 123.3  // rounds up
this.DOMHelper.getNumericValue('123.99', 0);  // => 124    // rounds up
this.DOMHelper.getNumericValue(456);          // => 456
```

### The `tabbableElements()` Method

Check and returns all tabbable and visible elements within the given host.

Accepts a single parameter `hostElement` of type `HTMLElement` and returns an array of `HTMLElement`.

It will retrieve all possible tabbable elements and validate their visibility using [the `isVisible()` method](#the-isvisible-method).

> **NOTE:** The method will check for and return:
>
> - All anchor elements with an `href` attribute.
> - All area elements with an `href` attribute.
> - All form elements that:
>   - Are `<input>` (except type `hidden`) and not `disabled`.
>   - Are `<select>` and not `disabled`.
>   - Are `<textarea>` and not `disabled`.
>   - Are `<button>` and not `disabled`.
> - All elements with `tabindex` attribute that:
>   - Does not have the attribute empty.
>   - Does not start the attribute with an hyphen (negative values).
> - All elements with `contenteditable` attribute that:
>   - Does have the attribute empty (means `true` by default).
>   - Does not have the attribute with value set on `false`.
>
> **Considerations for the `<fieldset>` element in forms:**
>
> Fieldsets can be disabled, which means that all its children elements will be disabled as well, so:
>
> - It will ignore all children elements from those `fieldset` that are `disabled`.
> - Nested `fieldset` will follow the same rule:
>   - If the parent `fieldset` is _not_ `disabled` but the nested one is, it will ignore all children elements from the nested `fieldset` only.
>   - If the parent `fieldset` _is_ `disabled` but the nested one is not, it will ignore all elements from the parent down.

```typescript
this.DOMHelper.tabbableElements(hostElement); // => [button, input, select, etc.]
```

### The `isImageElement()` Method

Check if an element is an image.

Accepts a single parameter `element` of type `HTMLElement`.

It will verify if the given element is:

- An `<img>` tag
- An `<area>` tag
- An `<input>` tag of `type="image"`
- Has a `role="img"`

```typescript
this.DOMHelper.isImageElement(element); // => true / false
```

### The `isInteractiveElement()` Method

Check if an element is interactive, meaning that the user can interact with it.

Accepts a single parameter `element` of type `HTMLElement`.

It will verify if the given element is:

- A native interactive element: `a[href]`, `button`, `textarea`, etc.
- A _role_ interactive element: `<div role="button" tabindex="0">`

```typescript
this.DOMHelper.isInteractiveElement(element); // => true / false
```

### The `canBeAriaLabelled()` Method

Check if an element can use `aria-label`/`aria-labelledby` attribute.

Accepts a single parameter `element` of type `HTMLElement`.

It will verify if the given element:

- Is interactive (`isInteractiveElement()` method).
- Is one of the allowed native tag elements (`header`, `nav`, `article`, etc.)
- Is **not** one of the disallowed native tag elements (`caption`, `code`, `strong`, etc.)
- Has one of the allowed ARIA roles (`group`, `status`, `img`, etc.)
- Does **not** have a disallowed ARIA role (`definition`, `deletion`, `emphasis`, etc.)

```typescript
this.DOMHelper.canBeAriaLabelled(element); // => true / false
```
