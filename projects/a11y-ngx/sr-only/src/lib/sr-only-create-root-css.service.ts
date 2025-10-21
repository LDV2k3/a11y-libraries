import { Injectable, ComponentFactoryResolver, ComponentRef, Injector, ApplicationRef } from '@angular/core';

import { ScreenReaderOnlyComponent } from './sr-only.component';

@Injectable({ providedIn: 'root' })
export class SROnlyCreateCSSRootService {
    private rootCSSAlreadyCreated: boolean = false;

    constructor(
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {}

    createCSSRoot(): void {
        if (this.rootCSSAlreadyCreated) return;

        this.rootCSSAlreadyCreated = true;

        const SROnlyRef: ComponentRef<ScreenReaderOnlyComponent> = this.componentFactoryResolver
            .resolveComponentFactory(ScreenReaderOnlyComponent)
            .create(this.injector);

        this.appRef.attachView(SROnlyRef.hostView);
    }
}
