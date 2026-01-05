import { Injectable, InjectionToken } from '@angular/core';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE, libName } from './color-scheme.errors';

import { ColorSchemeServiceRoot } from './color-scheme.service.root';
import { ColorScheme, ColorSchemeConfig, ColorSchemeGlobalConfig } from './color-scheme.type';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | undefined> = new InjectionToken<Window | undefined>(
    `${libName} Window Token`,
    {
        providedIn: 'root',
        factory: (): Window | undefined => (typeof window !== 'undefined' ? window : undefined),
    }
);

export const LOCAL_STORAGE: InjectionToken<Storage | undefined> = new InjectionToken<Storage | undefined>(
    `${libName} Local Storage Token`,
    {
        providedIn: 'root',
        factory: (): Storage | undefined => (typeof localStorage !== 'undefined' ? localStorage : undefined),
    }
);

@Injectable({ providedIn: 'root' })
export class ColorSchemeDummyConfigRootService {}

@Injectable({ providedIn: 'root' })
export class ColorSchemeDummyConfigCustomService {}

export function initColorSchemeRootConfigFactory(
    service: ColorSchemeServiceRoot,
    config: ColorScheme | ColorSchemeGlobalConfig
): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}

export function initColorSchemeCustomConfigFactory(
    service: ColorSchemeServiceRoot,
    configs: ColorSchemeConfig[] | ColorSchemeConfig[][]
): void {
    const flatConfig: ColorSchemeConfig[] = configs
        .map((config: ColorSchemeConfig | ColorSchemeConfig[]) => (!Array.isArray(config) ? [config] : config))
        .reduce((previous, current) => previous.concat(current), []);

    service.initCustomConfigs(flatConfig);
}
