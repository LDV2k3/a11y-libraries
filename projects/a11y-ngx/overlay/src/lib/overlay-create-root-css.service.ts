import { Injectable, ComponentFactoryResolver, ComponentRef, Injector, ApplicationRef } from '@angular/core';

import { OverlayBaseComponent } from './overlay.component.base';

@Injectable({ providedIn: 'root' })
export class OverlayCreateCSSRootService {
    private rootCSSAlreadyCreated: boolean = false;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {}

    createCSSRoot(): void {
        if (this.rootCSSAlreadyCreated) return;

        this.rootCSSAlreadyCreated = true;

        const overlayRef: ComponentRef<OverlayBaseComponent> = this.componentFactoryResolver
            .resolveComponentFactory(OverlayBaseComponent)
            .create(this.injector);

        this.appRef.attachView(overlayRef.hostView);
    }
}
