import { Injectable, InjectionToken } from '@angular/core';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './icon.errors';

import type { IconService } from './icon.service';

import type { IconConfig, IconGlobalStrategy } from './icon.type';

export const ICON_GLOBAL_CONFIG = new InjectionToken<IconGlobalStrategy>('A11y Icon Global Config');

@Injectable({ providedIn: 'root' })
export class IconDummyConfigService {}

export function initIconRootConfigFactory(service: IconService, config: IconConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}
