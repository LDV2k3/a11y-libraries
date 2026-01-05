import { Provider, InjectionToken } from '@angular/core';

import { ColorSchemeServiceRoot } from './color-scheme.service.root';

import { libName } from './color-scheme.errors';

import {
    ColorSchemeDummyConfigRootService,
    ColorSchemeDummyConfigCustomService,
    initColorSchemeRootConfigFactory,
    initColorSchemeCustomConfigFactory,
} from './color-scheme.module.providers.private';

import { ColorScheme, ColorSchemeConfig, ColorSchemeGlobalConfig } from './color-scheme.type';

export const COLOR_SCHEME_ROOT_CONFIG_INJECTOR = new InjectionToken<ColorScheme | ColorSchemeGlobalConfig>(
    `${libName} Root Config`
);
export const COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR = new InjectionToken<ColorSchemeConfig | ColorSchemeConfig[]>(
    `${libName} Custom Configs`
);

/**
 * @description
 * Provide Color Scheme globally (usable in standalone apps)
 */
export function provideA11yColorScheme(config: ColorScheme | ColorSchemeGlobalConfig): Provider[] {
    return [
        { provide: COLOR_SCHEME_ROOT_CONFIG_INJECTOR, useValue: config },
        {
            provide: ColorSchemeDummyConfigRootService,
            useFactory: initColorSchemeRootConfigFactory,
            deps: [ColorSchemeServiceRoot, COLOR_SCHEME_ROOT_CONFIG_INJECTOR],
        },
    ];
}

/** Provide Color Scheme custom feature (usable in standalone libs) */
export function provideA11yColorSchemeFeature(config: ColorSchemeConfig | ColorSchemeConfig[]): Provider[] {
    return [
        { provide: COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR, useValue: config, multi: true },
        {
            provide: ColorSchemeDummyConfigCustomService,
            useFactory: initColorSchemeCustomConfigFactory,
            deps: [ColorSchemeServiceRoot, COLOR_SCHEME_CUSTOM_CONFIG_INJECTOR],
        },
    ];
}
