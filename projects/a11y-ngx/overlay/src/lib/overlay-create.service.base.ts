import {
    Injectable,
    ComponentFactoryResolver,
    ComponentRef,
    Injector,
    Inject,
    ApplicationRef,
    EmbeddedViewRef,
    Type,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { OverlayService } from './overlay.service';
import { OverlayContainerService } from './overlay-container.service';

import { OverlayBaseComponent } from './overlay.component.base';
import { OverlayDirective } from './overlay.directive';

import { OverlayCustomConfig } from './overlay.type';
import { OverlayCustomNoTriggerConfig, OverlayProcessedConfig } from './overlay.type.private';

import { ERROR_DESTROY_METHOD_UNEXISTING } from './overlay.errors';

@Injectable({ providedIn: 'root' })
export class OverlayCreateBaseService {
    constructor(
        public componentFactoryResolver: ComponentFactoryResolver,
        public appRef: ApplicationRef,
        public injector: Injector,
        public overlayService: OverlayService,
        public containerService: OverlayContainerService,
        @Inject(DOCUMENT) public document: Document
    ) {}

    /**
     * @description
     * Creates the given component.
     *
     * _Usually the Step #1._
     */
    createComponent<T>(componentType: Type<T>, injector: Injector = this.injector): ComponentRef<T> {
        return this.componentFactoryResolver.resolveComponentFactory(componentType).create(injector);
    }

    /**
     * @description
     * Configures the given component instance with its trigger, config and destroy method.
     *
     * _Usually the Step #2._
     */
    configComponentInstance<T extends OverlayBaseComponent>(
        overlayRef: ComponentRef<T>,
        trigger: HTMLElement | DOMRect,
        customConfig?: OverlayCustomNoTriggerConfig | string,
        destroyMethod?: string
    ): void {
        const config: Required<OverlayProcessedConfig> = this.overlayService.getProcessedConfig(
            customConfig as OverlayCustomConfig
        );
        const configCombined: OverlayCustomConfig = { ...config.module, ...config.custom, trigger };
        const offsetSize: number = this.overlayService.getProcessedOffset(config);

        overlayRef.instance.setBaseConfig({ ...configCombined, offsetSize });
        overlayRef.instance.setOverlayConfig(configCombined);
        overlayRef.instance.setStyles(config.custom);

        if (destroyMethod) {
            const theDestroyMethod = overlayRef.instance[destroyMethod as keyof OverlayBaseComponent] as () => void;

            if (typeof theDestroyMethod !== 'function') {
                console.warn(ERROR_DESTROY_METHOD_UNEXISTING(destroyMethod));
                return;
            }

            (overlayRef.instance[destroyMethod as keyof OverlayBaseComponent] as () => void) = (): void =>
                this.destroyOverlay(overlayRef);
        }
    }

    /**
     * @description
     * Attach the component to the view.
     *
     * _Usually the Step #3._
     *
     * @returns The HTML Element of the host's instance.
     */
    attachViewAndGetComponentElement<T extends OverlayBaseComponent>(overlayRef: ComponentRef<T>): HTMLElement {
        // Attach the view to the app.
        this.appRef.attachView(overlayRef.hostView);

        // Returns the Host View as an HTML Element.
        return (overlayRef.hostView as EmbeddedViewRef<unknown>).rootNodes[0] as HTMLElement;
    }

    /**
     * @description
     * Attaches the Overlay element after the trigger.
     *
     * _Usually the Step #4._
     *
     * @param { HTMLElement } trigger - The given Trigger element.
     * @param { HTMLElement } overlayElement - The given Overlay content to be attached.
     */
    attachAfterTrigger(trigger: HTMLElement, overlayElement: HTMLElement): void {
        trigger.parentNode?.insertBefore(overlayElement, trigger.nextSibling);
    }

    /**
     * @description
     * Attaches the Overlay element to a container at the end of the `<body>`.
     *
     * _Usually the Step #4._
     *
     * @param { HTMLElement } overlayElement - The given Overlay content to be attached.
     */
    attachToBody(overlayElement: HTMLElement): void {
        this.containerService.overlayContainer.appendChild(overlayElement);
    }

    /**
     * @description
     * Removes the Overlay from the app view and destroys it.
     *
     * @param { ComponentRef<OverlayBaseComponent | OverlayDirective> } overlayRef - The given Overlay reference.
     */
    private destroyOverlay(overlayRef: ComponentRef<OverlayBaseComponent | OverlayDirective>): void {
        const overlayInstance: OverlayBaseComponent | OverlayDirective = overlayRef.instance;
        const isVisible: boolean = overlayInstance.isVisible;
        const killMs: number = isVisible ? overlayInstance.fadeMs : 0;

        if (isVisible) overlayInstance.hide();

        setTimeout(() => overlayRef.destroy(), killMs);
    }
}
