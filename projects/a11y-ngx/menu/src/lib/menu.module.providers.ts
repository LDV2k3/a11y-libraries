import { ENVIRONMENT_INITIALIZER, Provider, inject } from '@angular/core';

import { MenuRootService } from './menu.service.root';
import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './menu.errors';

import type { MenuConfig, MenuCustomConfig } from './menu.type';

/**
 * @description
 * Provides Menu globally (usable in standalone apps).
 */
export function provideA11yMenu(config: MenuConfig): Provider[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const service: MenuRootService = inject(MenuRootService);

                if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

                service.initRootConfig(config);
            },
            multi: true,
        },
    ];
}

/**
 * @description
 * Provides Menu custom feature (usable in routes or NgModules (EnvironmentInjector)).
 */
export function provideA11yMenuFeature(config: MenuCustomConfig): Provider[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => inject(MenuRootService).initCustomConfig(config),
            multi: true,
        },
    ];
}

/**
 * @description
 * Provides Menu custom feature (usable in standalone directives/components (Injection Context)).
 */
export function injectA11yMenuFeature(config: MenuCustomConfig): void {
    inject(MenuRootService).initCustomConfig(config);
}
