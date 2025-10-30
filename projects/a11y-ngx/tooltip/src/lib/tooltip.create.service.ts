import {
    Injectable,
    InjectionToken,
    Inject,
    Injector,
    Optional,
    SkipSelf,
    ComponentFactoryResolver,
    ComponentRef,
    ApplicationRef,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';

import { OverlayService, OverlayContainerService, OverlayCreateBaseService } from '@a11y-ngx/overlay';
import { ColorSchemeService } from '@a11y-ngx/color-scheme';

import { TooltipComponent } from './tooltip.component';

import { TOOLTIP_COLOR_SCHEME_PROPERTY } from './tooltip.color-scheme';

import { ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE } from './tooltip.errors';

import { Tooltip, TooltipConfig, TooltipRootConfig } from './tooltip.type';
import { TOOLTIP_SELECTOR } from './tooltip.type.private';

export const TOOLTIP_CONFIG_INJECTOR = new InjectionToken<TooltipConfig>('A11y Tooltip Root Config');

@Injectable({ providedIn: 'root' })
export class TooltipCreateService extends OverlayCreateBaseService {
    private rootConfigAlreadyProvided: boolean = false;

    /**
     * @description
     * To block any possible repeated use of `A11yTooltipModule.rootConfig()`.
     */
    get isRootConfigAlreadyProvided(): boolean {
        return this.rootConfigAlreadyProvided;
    }

    get globalConfig(): Partial<TooltipConfig> {
        return this.overlayService.getConfig(TOOLTIP_SELECTOR);
    }

    constructor(
        public cfr: ComponentFactoryResolver,
        public ar: ApplicationRef,
        public i: Injector,
        public os: OverlayService,
        public cs: OverlayContainerService,
        @Inject(DOCUMENT) public d: Document,

        private colorSchemeService: ColorSchemeService,
        @Optional() @SkipSelf() private parentService: TooltipCreateService
    ) {
        super(cfr, ar, i, os, cs, d);

        if (this.parentService) throw Error(ERROR_SERVICE_PROVIDED_MORE_THAN_ONCE());
    }

    initRootConfig(rootConfig: TooltipRootConfig): void {
        this.rootConfigAlreadyProvided = true;

        this.overlayService.updateConfig(TOOLTIP_SELECTOR, rootConfig);
        this.colorSchemeService.updateConfig(TOOLTIP_SELECTOR, rootConfig, TOOLTIP_COLOR_SCHEME_PROPERTY);
    }

    /**
     * Creates the Tooltip component, assigns the given configuration (if any) and appends it
     * right after the given Trigger element.
     *
     * @param { HTMLElement } trigger - The given Trigger element.
     * @param { Tooltip } content - The given content.
     * @param { TooltipConfig } customConfig - The given custom config (optional).
     * @returns { TooltipComponent } The `TooltipComponent` instance.
     */
    createTooltip(
        trigger: HTMLElement | DOMRect,
        content: Tooltip,
        customConfig?: Partial<TooltipConfig>
    ): TooltipComponent {
        /* Creates Tooltip component */
        const tooltipRef: ComponentRef<TooltipComponent> = this.createComponent(TooltipComponent);

        /* Set the Tooltip content. */
        tooltipRef.instance.customContent = content;
        tooltipRef.instance.setCustomSelector(TOOLTIP_SELECTOR);

        /* Set the configuration for the Overlay, Directive and Styles. */
        this.configComponentInstance(
            tooltipRef,
            trigger,
            { ...customConfig, selector: TOOLTIP_SELECTOR },
            'destroyTooltip'
        );

        /* Appends Tooltip component */
        const tooltipElement: HTMLElement = this.attachViewAndGetComponentElement(tooltipRef);

        if (trigger instanceof HTMLElement) {
            /* Attaches the Element after the Trigger. */
            this.attachAfterTrigger(trigger, tooltipElement);
        } else {
            /* Attaches the Element in a container within the <body>. */
            this.attachToBody(tooltipElement);
        }

        /* Returns Tooltip instance */
        return tooltipRef.instance;
    }
}
