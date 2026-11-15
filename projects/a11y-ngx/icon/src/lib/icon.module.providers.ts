import { ENVIRONMENT_INITIALIZER, Provider, InjectionToken, inject } from '@angular/core';

import { IconRootService } from './icon.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './icon.errors';

import type { IconCustomStrategy, IconConfig } from './icon.type';

export const ICON_CUSTOM_STRATEGY = new InjectionToken<IconCustomStrategy>('A11y Icon Custom Strategy Config');

/**
 * @description
 * Provides the Icon config globally (usable in standalone apps).
 */
export function provideA11yIcon(config: IconConfig): Provider[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const service: IconRootService = inject(IconRootService);

                if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

                service.initRootConfig(config);
            },
            multi: true,
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
