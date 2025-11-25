import { Injectable, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subject } from 'rxjs';

import { DocumentScroll } from './document-scroll.type';

@Injectable({ providedIn: 'root' })
export class DocumentScrollService implements OnDestroy {
    event: Subject<DocumentScroll> = new Subject<DocumentScroll>();

    constructor(
        @Inject(DOCUMENT) private document: Document | undefined,
        @Optional() @SkipSelf() private parentService: DocumentScrollService
    ) {
        if (this.parentService) {
            const errorMsg: string = `
                A11y Document Scroll:
                DocumentScrollService is a singleton and has been provided more than once.
                Please remove the service from any 'providers' array you may have added it to.
            `;
            throw Error(errorMsg.replace(/ {2,}/g, ''));
        }

        this.document?.addEventListener('scroll', this.documentScrollCallback.bind(this));
    }

    ngOnDestroy(): void {
        this.document?.removeEventListener('scroll', this.documentScrollCallback.bind(this));
    }

    private documentScrollCallback(): void {
        if (!window) return;
        this.event.next({ x: window.scrollX, y: window.scrollY });
    }
}
