import {
    Injectable,
    ComponentRef,
    ComponentFactoryResolver,
    ApplicationRef,
    Injector,
    Inject,
    TemplateRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { ColorSchemeService } from '@a11y-ngx/color-scheme';

import { OverlayComponent } from './overlay.component';

import { OverlayService } from './overlay.service';
import { OverlayCreateBaseService } from './overlay-create.service.base';
import { OverlayContainerService } from './overlay-container.service';

import { OverlayCustomNoTriggerConfig } from './overlay.type.private';

@Injectable({ providedIn: 'root' })
export class OverlayCreateService extends OverlayCreateBaseService {
    constructor(
        cfr: ComponentFactoryResolver,
        ar: ApplicationRef,
        i: Injector,
        os: OverlayService,
        cs: OverlayContainerService,
        @Inject(DOCUMENT) d: Document
    ) {
        super(cfr, ar, i, os, cs, d);
    }

    /**
     * @description
     * Creates the Overlay component, assigns the given configuration (if any) and appends it
     * right after the given Trigger element.
     *
     * @param { HTMLElement | DOMRect } trigger - The given Trigger element.
     * @param { TemplateRef<unknown> | string } content - The given content.
     * @param { OverlayCustomNoTriggerConfig | string } config - The given custom config (optional).
     * @returns { OverlayComponent } The `OverlayComponent` instance.
     */
    createOverlay(
        trigger: HTMLElement | DOMRect,
        content: TemplateRef<unknown> | string,
        config?: OverlayCustomNoTriggerConfig | string
    ): OverlayComponent {
        // Creates the Injector.
        const injector = Injector.create({
            providers: [{ provide: this.overlayService, useExisting: OverlayService, deps: [ColorSchemeService] }],
            parent: this.injector,
        });

        // Creates the Overlay component.
        const overlayRef: ComponentRef<OverlayComponent> = this.createComponent(OverlayComponent, injector);

        // Configures the instance.
        this.configComponentInstance(overlayRef, trigger, config, 'destroyOverlay');

        // Sets the given content.
        overlayRef.instance.customContent = content;

        // Appends the Overlay component.
        const overlayElement: HTMLElement = this.attachViewAndGetComponentElement(overlayRef);

        // Attaches the element.
        if (trigger instanceof HTMLElement) {
            // If trigger is of type HTMLElement, inserts the overlay after the trigger.
            this.attachAfterTrigger(trigger, overlayElement);
        } else {
            // If trigger is of type DOMRect, it will append it to the container.
            this.attachToBody(overlayElement);
        }

        // Returns the Overlay instance.
        return overlayRef.instance;
    }
}
