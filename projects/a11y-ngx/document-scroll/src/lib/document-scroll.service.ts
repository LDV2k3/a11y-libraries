import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { DocumentScroll } from './document-scroll.type';

@Injectable()
export class DocumentScrollService {
    event: Subject<DocumentScroll> = new Subject<DocumentScroll>();

    constructor() {
        document.addEventListener('scroll', () => this.event.next({ x: window.scrollX, y: window.scrollY }));
    }
}
