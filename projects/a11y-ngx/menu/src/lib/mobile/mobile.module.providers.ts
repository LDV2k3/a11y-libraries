import { ENVIRONMENT_INITIALIZER, Provider, inject } from '@angular/core';

import { MobileRootService } from './mobile.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './mobile.errors';

import type { MobileConfig } from './mobile.type';

/**
 * @description
 * Provides Mobile globally (usable in standalone apps).
 */
export function provideA11yMobile(config: MobileConfig): Provider[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const service: MobileRootService = inject(MobileRootService);

                if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

                service.initRootConfig(config);
            },
            multi: true,
        },
    ];
}
