# Responsive Image Maps

A responsive image map Angular directive that updates the areas' coordinates according to the image size.

It will manage all shapes (`rect`, `circle` and `poly`).

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Index

- [Installation](#installation)
- [Use](#use)
  - [The Map Directive](#the-map-directive)
    - [The Map public Properties, Getters and Methods](#map-directive-public-properties-getters-and-methods)
    - [The MapSize Type](#the-mapsize-type)
  - [The Area Directive](#the-area-directive)
    - [The Area public Properties, Getters and Methods](#area-directive-public-properties-getters-and-methods)
    - [The AreaSize Type](#the-areasize-type)
- [Working Example](#working-example)

## Installation

1. Install npm package:

    `npm install @a11y-ngx/responsive-image-maps --save`

2. Import `A11yResponsiveImageMapsModule` into your module or standalone component:

    ```typescript
    import { A11yResponsiveImageMapsModule } from '@a11y-ngx/responsive-image-maps';

    @NgModule({
        declarations: [...],
        imports: [
            ...
            A11yResponsiveImageMapsModule,
        ],
    })
    export class AppModule { }
    ```

## Use

Add an image with a map in your template.

### The Map Directive

- The Map directive will pick any `<map>` tag with `[name]` attribute in it and search for the `<img>` with `[usemap]` matching that name.
- When the image has been loaded for the first time, it will:
  - Update `loaded` with `true`.
  - Emit `sizeChanged`.
- When the main `<img>` resizes, all `<area>` elements will update their coordinates based on the new image size.
- The directive can be accessed using a template variable through the exported name of `responsiveImageMap`.
- The directive will auto update sizes when the page resizes (using [Window Resize Service](https://www.npmjs.com/package/@a11y-ngx/window-resize)).
- If the image changes its size:
  - Through window resize, `(sizeChanged)` output will emit the new `MapSize`.
  - Pogrammatically, the sizes (image and areas) can be manually updated using the `update()` method from the exported directive.
- The HTML `<map>` element can be reached through the `nativeElement` property.
- The HTML `<img>` element can be reached through the `imageElement` property.

#### Map Directive public Properties, Getters and Methods

| Property | Type | Returns | Description |
|:---------|:-----|:--------|:------------|
| `loaded` | `BehaviorSubject` | `boolean` | Will return `true` when the image has been loaded |
| `sizeChanged` | `EventEmitter` | [`MapSize`](#the-mapsize-type) | Will emit the new image's size & position when page resize and it changes the width and height values |
| `areas` | `QueryList` | `ResponsiveImageAreaDirective` | To access all `<area>` children directives |
| `scaleFactor` | `get` | `{ width: number, height: number }` | The scale factor from the image's original full size and the resized size |
| `imageSize` | [`MapSize`](#the-mapsize-type) | `object` | To access all the values (size & position) from the main image |
| `nativeElement` | `get` | `HTMLMapElement` | To access the HTML `<map>` element |
| `imageElement` | `get` | `HTMLImageElement` | To access the HTML `<img>` element that the `<map>` is attached to |
| `update()` | `method` | `void` | Will update the image new values and all the `<area>`'s new coordinates accordingly |

#### The MapSize Type

| Property | Type | Description |
|:---------|:----:|:------------|
| `top` | `number` | The image `DOMRect`'s top value |
| `left` | `number` | The image `DOMRect`'s left value |
| `width` | `number` | The image `DOMRect`'s width value |
| `height` | `number` | The image `DOMRect`'s height value |
| `fullWidth` | `number` | The image's original full width size (resized or not) |
| `fullHeight` | `number` | The image's original full height size (resized or not) |

### The Area Directive

- The Area directive will pick any `<area>` tag with `[shape]` and `[coords]` attributes.
- This directive will manage the area size (either relative to the image or to the viewport).
- Each directive can be accessed:
  - Using a template variable through the exported name of `responsiveImageArea`.
  - From the [Map directive](#the-map-directive) through the `areas` property, which will return a `QueryList<ResponsiveImageAreaDirective>`.
- The HTML `<area>` element can be reached through the `nativeElement` property.

#### Area Directive public Properties, Getters and Methods

| Property | Type | Returns | Description |
|:---------|:-----|:--------|:------------|
| `areaSize` | [`AreaSize`](#the-areasize-type) | `object` | To access all the values (size & position) from the area (relative to the image) |
| `nativeElement` | `get` | `HTMLAreaElement` | To access the HTML `<area>` element |
| `getBoundingClientRect()` | `method` | `DOMRect` | To get the calculated position of the `<area>` element (relative to the viewport) |
| `updateCoords()` | `method` | `void` | Will update the `[coords]` attribute based on the image size. _(**NOTE:** there's no need to trigger this manually, the map directive will update when needed)_ |

#### The AreaSize Type

| Property | Type | Description |
|:---------|:----:|:------------|
| `top` | `number` | The area's (relative to image) top value |
| `left` | `number` | The area's (relative to image) left value |
| `width` | `number` | The area's width value |
| `height` | `number` | The area's height value |

## Working Example

TypeScript

```typescript
import { ResponsiveImageMapDirective, MapSize, AreaSize } from '@a11y-ngx/responsive-image-maps';

@Component({ ... })
export class MyComponent {
    @ViewChild('imageMap') imageMap: ResponsiveImageMapDirective;

    updateOtherElements(newSize: MapSize): void {
        const width = newSize.width;
        const height = newSize.height;
        ...

        this.imageMap.areas.forEach(area => {
            const areaElement = area.nativeElement;
            const areaSize: AreaSize = area.areaSize;
            ...
        });
    }

    updateMapSizes(): void {
        this.imageMap.update();
    }
}
```

HTML

```html
<img src="https://www.w3schools.com/html/workplace.jpg" alt="Workplace" usemap="#workmap">

<map name="workmap" #imageMap="responsiveImageMap" (sizeChanged)="updateOtherElements($event)">
    <area shape="rect" coords="34,44,270,350" alt="Computer" href="...">
    <area shape="rect" coords="290,172,333,250" alt="Phone" href="...">
    <area shape="circle" coords="337,300,44" alt="Coffee" href="...">
</map>
```
