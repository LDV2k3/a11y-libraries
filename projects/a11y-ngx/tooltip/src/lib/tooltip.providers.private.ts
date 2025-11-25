import { Injectable, InjectionToken } from '@angular/core';

import { TooltipCreateService } from './tooltip.create.service';

import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './tooltip.errors';
import { TooltipRootConfig } from './tooltip.type';

// Token to inject window object when available.
// Primarily not to break SSR (Server Side Rendering) projects.
export const WINDOW: InjectionToken<Window | undefined> = new InjectionToken<Window | undefined>(
    'Tooltip Window Token',
    {
        providedIn: 'root',
        factory: (): Window | undefined => (typeof window !== 'undefined' ? window : undefined),
    }
);

@Injectable({ providedIn: 'root' })
export class TooltipDummyConfigService {}

export function initTooltipRootConfigFactory(service: TooltipCreateService, config: TooltipRootConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}
