import { Injectable, OnDestroy, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { OVERLAY_CONTAINER_CLASS } from './overlay.type.private';

@Injectable({ providedIn: 'root' })
export class OverlayContainerService implements OnDestroy {
    private overlayContainerElement!: HTMLDivElement;

    get overlayContainer(): HTMLDivElement {
        if (!this.overlayContainerElement) this.createContainer();

        return this.overlayContainerElement;
    }

    constructor(@Inject(DOCUMENT) private document: Document) {}

    ngOnDestroy(): void {
        this.overlayContainerElement?.remove();
    }

    private createContainer(): void {
        const containerElement: HTMLDivElement = this.document.createElement('div');
        containerElement.classList.add(OVERLAY_CONTAINER_CLASS);

        this.document.body.appendChild(containerElement);
        this.overlayContainerElement = containerElement;
    }
}
