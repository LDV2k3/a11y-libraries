# Document Scroll

A simple document scroll listener service.

This library was generated with [Angular CLI](https://github.com/angular/angular-cli) version 9.1.13.

## Installation

1. Install npm package:

   `npm install @a11y-ngx/document-scroll --save`

2. Import `A11yDocumentScrollModule` into your module:

```typescript
import { A11yDocumentScrollModule } from '@a11y-ngx/document-scroll';

@NgModule({
    declarations: [...],
    imports: [
        ...
        A11yDocumentScrollModule
    ]
})
export class AppModule { }
```

## Use

Subscribe to the service's `event` which will return an object of type `DocumentScroll` containing the document's `x` & `y` scroll position.

```typescript
import { DocumentScrollService, DocumentScroll } from '@a11y-ngx/document-scroll';
import { debounceTime } from 'rxjs/operators';
...
@Directive({ selector: '[...]' })
export class MyDirective {
    constructor(
        private documentScroll: DocumentScrollService
    ) {
        this.documentScroll.event
            .pipe(debounceTime(100))
            .subscribe((scroll: DocumentScroll) => this.stickyHeader(scroll));
    }

    stickyHeader(scroll: DocumentScroll): void {
        const documentX: scroll.x;
        const documentY: scroll.y;
        ...
    }
}
```
