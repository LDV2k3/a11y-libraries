import {
    Injectable,
    Renderer2,
    RendererFactory2,
    Injector,
    ComponentFactoryResolver,
    ApplicationRef,
    ComponentRef,
    EmbeddedViewRef,
} from '@angular/core';

import { OverlayArrowComponent } from './overlay-arrow.component';

import { OverlayDirective } from './overlay.directive';

@Injectable({ providedIn: 'root' })
export class OverlayArrowService {
    private r2: Renderer2 = this.rendererFactory.createRenderer(null, null);

    constructor(
        private rendererFactory: RendererFactory2,
        private componentFactoryResolver: ComponentFactoryResolver,
        private appRef: ApplicationRef,
        private injector: Injector
    ) {}

    /**
     * @description
     * Creates the Arrow component.
     *
     * @param { HTMLElement } hostElement - The host element where the arrow will be appended.
     * @param { OverlayDirective } hostDirective - The host directive.
     * @returns The `OverlayArrowComponent` instance.
     */
    createArrow(hostElement: HTMLElement, hostDirective: OverlayDirective): OverlayArrowComponent {
        // Creates Arrow component.
        const injector: Injector = Injector.create({
            providers: [{ provide: OverlayDirective, useValue: hostDirective }],
            parent: this.injector,
        });

        const overlayArrowRef: ComponentRef<OverlayArrowComponent> = this.componentFactoryResolver
            .resolveComponentFactory(OverlayArrowComponent)
            .create(injector);

        overlayArrowRef.instance.destroyArrow = () => this.destroyArrow(overlayArrowRef);

        // Appends Arrow component.
        const overlayArrowElement: HTMLElement = (overlayArrowRef.hostView as EmbeddedViewRef<unknown>)
            .rootNodes[0] as HTMLElement;

        this.appRef.attachView(overlayArrowRef.hostView);
        this.r2.appendChild(hostElement, overlayArrowElement);

        // Returns Arrow comnponent instance
        return overlayArrowRef.instance;
    }

    /**
     * @description
     * Removes the Arrow from the app view and destroys it.
     *
     * @param { ComponentRef<OverlayArrowComponent> } arrowRef - The given Arrow reference.
     */
    destroyArrow(arrowRef: ComponentRef<OverlayArrowComponent>): void {
        this.appRef.detachView(arrowRef.hostView);
        arrowRef.destroy();
    }
}
