import { Provider } from '@angular/core';

import { MobileRootService } from './mobile.service.root';

import {
    MOBILE_CONFIG_INJECTOR,
    MobileDummyConfigService,
    initMobileRootConfigFactory,
} from './mobile.module.providers.private';

import type { MobileConfig } from './mobile.type';

/**
 * @description
 * Provides Mobile globally (usable in standalone apps).
 */
export function provideA11yMobile(config: MobileConfig): Provider[] {
    return [
        { provide: MOBILE_CONFIG_INJECTOR, useValue: config },
        {
            provide: MobileDummyConfigService,
            useFactory: initMobileRootConfigFactory,
            deps: [MobileRootService, MOBILE_CONFIG_INJECTOR],
        },
    ];
}
