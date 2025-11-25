import { Injectable, Inject, OnDestroy, Optional, SkipSelf } from '@angular/core';
import { Subject } from 'rxjs';

import { WINDOW } from './window-resize.providers';

import { WindowResize } from './window-resize.type';

@Injectable({ providedIn: 'root' })
export class WindowResizeService implements OnDestroy {
    readonly event: Subject<WindowResize> = new Subject<WindowResize>();

    constructor(
        @Inject(WINDOW) private window: Window | undefined,
        @Optional() @SkipSelf() private parentService: WindowResizeService
    ) {
        if (this.parentService) {
            const errorMsg: string = `
                A11y Window Resize:
                WindowResizeService is a singleton and has been provided more than once.
                Please remove the service from any 'providers' array you may have added it to.
            `;
            throw Error(errorMsg.replace(/ {2,}/g, ''));
        }

        this.window?.addEventListener('resize', this.windowResizeCallback.bind(this));
    }

    ngOnDestroy(): void {
        this.window?.removeEventListener('resize', this.windowResizeCallback.bind(this));
    }

    private windowResizeCallback(e: Event): void {
        this.event.next({
            width: (e.target as Window).innerWidth,
            height: (e.target as Window).innerHeight,
        });
    }
}
