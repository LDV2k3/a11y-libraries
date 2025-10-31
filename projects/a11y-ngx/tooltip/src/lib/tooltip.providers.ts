import { Injectable, Provider } from '@angular/core';

import { TOOLTIP_CONFIG_INJECTOR, TooltipCreateService } from './tooltip.create.service';

import { TooltipRootConfig } from './tooltip.type';
import { ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE } from './tooltip.errors';

/** Provide Tooltip globally (usable in standalone apps) */
export function provideA11yTooltip(config: TooltipRootConfig): Provider[] {
    return [
        { provide: TOOLTIP_CONFIG_INJECTOR, useValue: config },
        {
            provide: TooltipDummyConfigService,
            useFactory: initTooltipRootConfigFactory,
            deps: [TooltipCreateService, TOOLTIP_CONFIG_INJECTOR],
        },
    ];
}

@Injectable({ providedIn: 'root' })
export class TooltipDummyConfigService {}

export function initTooltipRootConfigFactory(service: TooltipCreateService, config: TooltipRootConfig): void {
    if (service.isRootConfigAlreadyProvided) throw new Error(ERROR_ROOT_CONFIG_CALLED_MORE_THAN_ONCE());

    service.initRootConfig(config);
}
