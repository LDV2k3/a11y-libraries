# Document Scroll

A simple document scroll listener singleton service.

![Angular support from version 12 up to version 20](https://img.shields.io/badge/Angular-v12_to_v20-darkgreen?logo=angular)

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0 to ensure compatibility with a wide range of Angular versions. It has been tested up to v20.

## Installation

1. Install npm package:

   `npm install @a11y-ngx/document-scroll --save`

2. Import `DocumentScrollService` into your typescript file:

```typescript
import { DocumentScrollService } from '@a11y-ngx/document-scroll';

constructor(private documentScroll: DocumentScrollService) {}
```

## Use

Subscribe to the service's `event` which will return an object of type `DocumentScroll` containing the document's `x` & `y` scroll position.

```typescript
import { DocumentScrollService, DocumentScroll } from '@a11y-ngx/document-scroll';
import { debounceTime } from 'rxjs/operators';
...
@Directive({ selector: '[...]' })
export class MyDirective implements OnDestroy {
    private readonly destroy$: Subject<void> = new Subject<void>();

    constructor(
        private documentScroll: DocumentScrollService
    ) {
        this.documentScroll.event
            .pipe(debounceTime(100), takeUntil(this.destroy$))
            .subscribe((scroll: DocumentScroll) => this.stickyHeader(scroll));
    }

    stickyHeader(scroll: DocumentScroll): void {
        const documentX: scroll.x;
        const documentY: scroll.y;
        ...
    }

    ngOnDestroy(): void {
        this.destroy$.next();
        this.destroy$.complete();
    }
}
```
