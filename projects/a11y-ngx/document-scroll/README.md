# Document Scroll

A simple document scroll listener singleton service.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 12.2.0.

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
