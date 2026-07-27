import { Injectable, InjectionToken } from '@angular/core';

import type { MobileRootService } from './mobile.service.root';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE, libName } from './mobile.errors';

import type { MobileConfig } from './mobile.type';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | null> = new InjectionToken<Window | null>(`${libName} Window Token`, {
    providedIn: 'root',
    factory: (): Window | null => (typeof window !== 'undefined' ? window : /* istanbul ignore next */ null),
});

export const MOBILE_CONFIG_INJECTOR = new InjectionToken<MobileConfig>('A11y Mobile Config');

@Injectable({ providedIn: 'root' })
export class MobileDummyConfigService {}

export function initMobileRootConfigFactory(service: MobileRootService, config: MobileConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}
