import { Provider } from '@angular/core';

import { ThemeRootService } from './theme.service.root';

import {
    THEME_CONFIG_INJECTOR,
    ThemeDummyConfigService,
    initThemeRootConfigFactory,
} from './theme.module.providers.private';

import type { Theme } from './theme.type';

/**
 * @description
 * Provides Theme globally (usable in standalone apps).
 */
export function provideA11yTheme(theme: Theme): Provider[] {
    return [
        { provide: THEME_CONFIG_INJECTOR, useValue: theme },
        {
            provide: ThemeDummyConfigService,
            useFactory: initThemeRootConfigFactory,
            deps: [ThemeRootService, THEME_CONFIG_INJECTOR],
        },
    ];
}
