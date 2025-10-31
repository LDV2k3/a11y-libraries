import { Injectable, Provider, InjectionToken } from '@angular/core';

import { OverlayService } from './overlay.service';

import { OverlayRootConfig, OverlayCustomConfig } from './overlay.type';
import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './overlay.errors';

export const OVERLAY_ROOT_CONFIG_INJECTOR = new InjectionToken<OverlayRootConfig>('A11y Overlay Root Config');
export const OVERLAY_CUSTOM_CONFIG_INJECTOR = new InjectionToken<OverlayCustomConfig>('A11y Overlay Custom Configs');

/** Provide Overlay globally (usable in standalone apps) */
export function provideA11yOverlay(config: OverlayRootConfig): Provider[] {
    return [
        { provide: OVERLAY_ROOT_CONFIG_INJECTOR, useValue: config },
        {
            provide: OverlayDummyConfigRootService,
            useFactory: initOverlayRootConfigFactory,
            deps: [OverlayService, OVERLAY_ROOT_CONFIG_INJECTOR],
        },
    ];
}

/** Provide Overlay feature (usable in standalone apps) */
export function provideA11yOverlayFeature(config: OverlayCustomConfig): Provider[] {
    return [
        { provide: OVERLAY_CUSTOM_CONFIG_INJECTOR, useValue: config, multi: true },
        {
            provide: OverlayDummyConfigCustomService,
            useFactory: initOverlayCustomConfigFactory,
            deps: [OverlayService, OVERLAY_CUSTOM_CONFIG_INJECTOR],
        },
    ];
}

@Injectable({ providedIn: 'root' })
export class OverlayDummyConfigRootService {}

@Injectable({ providedIn: 'root' })
export class OverlayDummyConfigCustomService {}

export function initOverlayRootConfigFactory(service: OverlayService, config: OverlayRootConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}

export function initOverlayCustomConfigFactory(service: OverlayService, configs: OverlayCustomConfig[]): void {
    service.initCustomConfigs(configs);
}
