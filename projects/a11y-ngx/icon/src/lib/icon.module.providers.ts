import { Provider, InjectionToken } from '@angular/core';

import { IconService } from './icon.service';

import { ICON_GLOBAL_CONFIG, IconDummyConfigService, initIconRootConfigFactory } from './icon.module.providers.private';

import type { IconCustomStrategy, IconConfig } from './icon.type';

export const ICON_CUSTOM_STRATEGY = new InjectionToken<IconCustomStrategy>('A11y Icon Custom Strategy Config');

/**
 * @description
 * Provides the Icon config globally (usable in standalone apps).
 */
export function provideA11yIcon(config: IconConfig): Provider[] {
    return [
        { provide: ICON_GLOBAL_CONFIG, useValue: config },
        {
            provide: IconDummyConfigService,
            useFactory: initIconRootConfigFactory,
            deps: [IconService, ICON_GLOBAL_CONFIG],
        },
    ];
}

/**
 * @description
 * Provides the Icon strategy locally (usable in standalone components, low-level modules or libraries).
 *
 * @note
 * If you need to provide it differently, use the `ICON_CUSTOM_STRATEGY` injection token.
 */
export function provideCustomA11yIcon(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    factory: (...args: any[]) => IconCustomStrategy | undefined | null,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps: any[] = []
): Provider {
    return {
        provide: ICON_CUSTOM_STRATEGY,
        useFactory: factory,
        deps,
    };
}
