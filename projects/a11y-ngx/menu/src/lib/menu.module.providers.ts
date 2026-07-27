import { Provider, InjectionToken } from '@angular/core';

import { MenuRootService } from './menu.service.root';

import {
    MenuDummyConfigService,
    MenuDummyConfigCustomService,
    initMenuRootConfigFactory,
    initMenuCustomConfigFactory,
} from './menu.module.providers.private';

import type { MenuConfig, MenuCustomConfig } from './menu.type';

export const MENU_CONFIG_INJECTOR = new InjectionToken<MenuConfig>('A11y Menu Root Config');
export const MENU_CUSTOM_CONFIG_INJECTOR = new InjectionToken<MenuCustomConfig>('A11y Menu Custom Configs');

/**
 * @description
 * Provides Menu globally (usable in standalone apps).
 */
export function provideA11yMenu(config: MenuConfig): Provider[] {
    return [
        { provide: MENU_CONFIG_INJECTOR, useValue: config },
        {
            provide: MenuDummyConfigService,
            useFactory: initMenuRootConfigFactory,
            deps: [MenuRootService, MENU_CONFIG_INJECTOR],
        },
    ];
}

/**
 * @description
 * Provides Menu custom feature (usable in standalone libs/components).
 */
export function provideA11yMenuFeature(config: MenuCustomConfig): Provider[] {
    return [
        { provide: MENU_CUSTOM_CONFIG_INJECTOR, useValue: config, multi: true },
        {
            provide: MenuDummyConfigCustomService,
            useFactory: initMenuCustomConfigFactory,
            deps: [MenuRootService, MENU_CUSTOM_CONFIG_INJECTOR],
        },
    ];
}
