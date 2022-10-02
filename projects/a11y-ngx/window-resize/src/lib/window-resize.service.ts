import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

import { WindowResize } from './window-resize.type';

@Injectable()
export class WindowResizeService {
    event: Subject<WindowResize> = new Subject<WindowResize>();

    constructor() {
        window.addEventListener('resize', (e: Event) =>
            this.event.next({
                width: (e.target as Window).innerWidth,
                height: (e.target as Window).innerHeight
            })
        );
    }
}
