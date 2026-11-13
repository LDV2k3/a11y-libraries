import { ENVIRONMENT_INITIALIZER, Provider, inject } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './theme.errors';

/**
 * @description
 * Provides Theme globally (usable in standalone apps).
 */
export function provideA11yTheme(theme: 'light' | 'dark' | 'auto'): Provider[] {
    return [
        {
            provide: ENVIRONMENT_INITIALIZER,
            useValue: () => {
                const service: ThemeRootService = inject(ThemeRootService);

                if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

                if (theme !== 'auto') service.initRootConfig(theme);
            },
            multi: true,
        },
    ];
}
