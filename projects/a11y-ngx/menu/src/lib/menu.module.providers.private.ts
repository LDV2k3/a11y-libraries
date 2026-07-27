import { Injectable, InjectionToken } from '@angular/core';

import type { MenuRootService } from './menu.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE, libName } from './menu.errors';

import type { MenuConfig, MenuCustomConfig } from './menu.type';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | null> = new InjectionToken<Window | null>(`${libName} Window Token`, {
    providedIn: 'root',
    factory: (): Window | null => (typeof window !== 'undefined' ? window : /* istanbul ignore next */ null),
});

@Injectable({ providedIn: 'root' })
export class MenuDummyConfigService {}

@Injectable({ providedIn: 'root' })
export class MenuDummyConfigCustomService {}

export function initMenuRootConfigFactory(service: MenuRootService, config: MenuConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}

export function initMenuCustomConfigFactory(service: MenuRootService, configs: MenuCustomConfig[]): void {
    service.initCustomConfigs(configs);
}
