# Window Resize

A simple window resize listener singleton service.

![Angular support from version 12 up to version 20](https://img.shields.io/badge/Angular-v12_to_v20-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v20.

## Installation

1. Install npm package:

   `npm install @a11y-ngx/window-resize --save`

2. Import `WindowResizeService` into your typescript file:

```typescript
import { WindowResizeService } from '@a11y-ngx/window-resize';

constructor(private resizeService: WindowResizeService) {}
```

## Use

Subscribe to the service's `event` which will return an object of type `WindowResize` containing the window's width & height.

```typescript
import { WindowResizeService, WindowResize } from '@a11y-ngx/window-resize';
import { debounceTime } from 'rxjs/operators';
...
@Directive({ selector: '[...]' })
export class MyDirective implements OnDestroy {
    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(
        private resizeService: WindowResizeService
    ) {
        this.resizeService.event
            .pipe(debounceTime(100), takeUntil(this.destroy$))
            .subscribe((windowSize: WindowResize) => this.updateSize(windowSize));
    }

    updateSize(windowSize: WindowResize): void {
        const windowWidth: windowSize.width;
        const windowHeight: windowSize.height;
        ...
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```
