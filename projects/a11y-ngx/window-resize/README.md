# Window Resize

A simple window resize listener service.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

## Installation

1. Install npm package:

   `npm install @a11y-ngx/window-resize --save`

2. Import `A11yWindowResizeModule` into your module:

```typescript
import { A11yWindowResizeModule } from '@a11y-ngx/window-resize';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yWindowResizeModule
    ]
})
export class AppModule { }
```

## Use

Subscribe to the service's `event` which will return an object of type `WindowResize` containing the window's width & height.

```typescript
import { WindowResizeService, WindowResize } from '@a11y-ngx/window-resize';
import { debounceTime } from 'rxjs/operators';
...
@Directive({ selector: '[...]' })
export class MyDirective {
    constructor(
        private resizeService: WindowResizeService
    ) {
        this.resizeService.event
            .pipe(debounceTime(100))
            .subscribe((windowSize: WindowResize) => this.updateSize(windowSize));
    }

    updateSize(windowSize: WindowResize): void {
        const windowWidth: windowSize.width;
        const windowHeight: windowSize.height;
        ...
    }
}
```
