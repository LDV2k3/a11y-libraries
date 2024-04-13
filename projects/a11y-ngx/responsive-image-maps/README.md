# Responsive Image Maps

A responsive image map directive that updates the areas' coordinates according to the image size.

> ⚠️ **IMPORTANT:** Currently `rect` and `circle` shapes are supported, `poly` will be supported in future releases.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Installation

1. Install npm package:

   `npm install @a11y-ngx/responsive-image-maps --save`

2. Import `A11yResponsiveImageMapsModule` into your module:

```typescript
import { A11yResponsiveImageMapsModule } from '@a11y-ngx/responsive-image-maps';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yResponsiveImageMapsModule
    ]
})
export class AppModule { }
```

## Use

Create an image map.

### The Map Directive

- The Map directive will pick any `<map>` tag with `[name]` attribute in it and search for the `<img>` with `[usemap]` matching that name.
- When the main `<img>` resize, all `<area>` elements will update their coordinates based on the new image size.
- The directive can be accessed using a template variable with `responsiveImageMap`.
- The directive will auto update sizes when the page resize (using [Window Resize Service](https://www.npmjs.com/package/@a11y-ngx/window-resize)).
- If the image changes size (through window resize), `(sizeChanged)` output will emit the new `MapSize`.
- If the image changes size (programmatically), sizes can be manually updated using the `update()` method from the exported directive.
- The HTML `<map>` element can be reached through the `nativeElement` property.

#### Map Directive public Properties, Getters and Methods

| Property | Type | Returns | Description |
|:---------|:-----|:--------|:------------|
| `loaded` | `BehaviorSubject` | `boolean` | Will return `true` when the image has loaded |
| `sizeChanged` | `EventEmitter` | [`MapSize`](#the-mapsize-interface) | Will emit the new image's size & position when page resize and it changes the width and height values |
| `areas` | `QueryList` | `ResponsiveImageAreaDirective` | To access all `<area>` children directives |
| `scaleFactor` | `getter` | `{ width: number, height: number }` | The scale factor from the image's original full size and the resized size |
| `imageSize` | [`MapSize`](#the-mapsize-interface) | `object` | To access all the values (size & position) from the main image |
| `nativeElement` | `getter` | `HTMLMapElement` | To access the HTML `<map>` element |
| `imageElement` | `getter` | `HTMLImageElement` | To access the HTML `<img>` element that the `<map>` is attached to |
| `update()` | `method` | `void` | Will update the image new values and all the `<area>`'s new coordinates accordingly |

#### The MapSize Interface

| Property | Type | Description |
|:---------|:----:|:------------|
| `top` | `number` | The image `DOMRect`'s top value |
| `left` | `number` | The image `DOMRect`'s left value |
| `width` | `number` | The image `DOMRect`'s width value |
| `height` | `number` | The image `DOMRect`'s height value |
| `fullWidth` | `number` | The image's original full width size (resized or not) |
| `fullHeight` | `number` | The image's original full height size (resized or not) |

### The Area Directive

- The Area directive will pick any `<area>` tag with `[shape]` attribute of value `"rect"` or `"circle"`.
- This directive will manage the area size (either relative to the image or to the viewport).
- These directives can be accessed from the [Map directive](#the-map-directive) through the `areas` property, which will return a `QueryList<ResponsiveImageAreaDirective>`.
- The HTML `<area>` element can be reached through the `nativeElement` property.

#### Area Directive public Properties, Getters and Methods

| Property | Type | Returns | Description |
|:---------|:-----|:--------|:------------|
| `areaSize` | [`AreaSize`](#the-areasize-interface) | `object` | To access all the values (size & position) from the area (relative to the image) |
| `nativeElement` | `getter` | `HTMLAreaElement` | To access the HTML `<area>` element |
| `getBoundingClientRect()` | `method` | `DOMRect` | To get the calculated position of the `<area>` element (relative to the viewport) |
| `updateCoords()` | `method` | `void` | Will update the `[coords]` attribute based on the image size. _(**NOTE:** there's no need to trigger this manually, the map directive will update when needed)_ |

#### The AreaSize Interface

| Property | Type | Description |
|:---------|:----:|:------------|
| `top` | `number` | The area's (relative to image) top value |
| `left` | `number` | The area's (relative to image) left value |
| `width` | `number` | The area's (relative to image) width value |
| `height` | `number` | The area's (relative to image) height value |

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
